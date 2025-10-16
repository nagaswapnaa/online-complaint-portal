require('dotenv').config();
const cron = require('node-cron');
const db = require('./db');
const nodemailer = require('nodemailer');

const ESCALATION_HOURS = parseInt(process.env.ESCALATION_HOURS || '48', 10);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

cron.schedule('10 * * * *', async () => { // runs at minute 10 each hour
  try {
    console.log('[escalationJob] Running check...');
    const [rows] = await db.query(
      `SELECT c.*, u.email AS user_email FROM complaints c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.status != 'Resolved' AND c.escalated = FALSE
       AND TIMESTAMPDIFF(HOUR, c.created_at, NOW()) > ?`,
      [ESCALATION_HOURS]
    );

    for (const complaint of rows) {
      try {
        // picker: first senior admin
        const [authRows] = await db.query('SELECT * FROM senior_admins ORDER BY id LIMIT 1');
        if (authRows.length === 0) {
          console.warn('No senior authority found.');
          continue;
        }
        const authority = authRows[0];
        const newLevel = (complaint.escalation_level || 0) + 1;

        await db.query(
          'UPDATE complaints SET escalated = TRUE, escalated_at = NOW(), escalation_level = ?, assigned_admin_id = ?, updated_at = NOW() WHERE id = ?',
          [newLevel, authority.id, complaint.id]
        );

        if (complaint.user_id) {
          await db.query('INSERT INTO notifications (user_id, message, url) VALUES (?, ?, ?)', [
            complaint.user_id,
            `Your complaint "${complaint.title}" has been escalated to ${authority.name}.`,
            `/complaints/${complaint.id}`
          ]);
        }

        await db.query('INSERT INTO notifications (admin_id, message, url) VALUES (?, ?, ?)', [
          authority.id,
          `You have been assigned an escalated complaint ID ${complaint.id}.`,
          `/admin/complaints/${complaint.id}`
        ]);

        // send emails
        await transporter.sendMail({
          from: process.env.NOTIFICATION_FROM || process.env.EMAIL_USER,
          to: authority.email,
          subject: `Auto-Escalated Complaint ${complaint.id}`,
          html: `<p>Complaint ${complaint.id} auto-escalated.</p>`
        }).catch(console.error);

        if (complaint.user_email) {
          await transporter.sendMail({
            from: process.env.NOTIFICATION_FROM || process.env.EMAIL_USER,
            to: complaint.user_email,
            subject: `Your complaint ${complaint.id} has been escalated`,
            html: `<p>Your complaint "${complaint.title}" was escalated automatically.</p>`
          }).catch(console.error);
        }

        console.log(`[escalationJob] Escalated ${complaint.id} -> ${authority.email}`);
      } catch (innerErr) {
        console.error('Escalation error for', complaint.id, innerErr);
      }
    }
    console.log('[escalationJob] Completed run');
  } catch (err) {
    console.error('[escalationJob] Failed', err);
  }
});
