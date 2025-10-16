const db = require("../db");
const nodemailer = require("nodemailer");

// runs every X hours to find unresolved complaints
async function checkForEscalations() {
  const [complaints] = await db.query(`
    SELECT * FROM complaints 
    WHERE status != 'resolved' 
    AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 48 
    AND escalation_level = 0
  `);

  for (const complaint of complaints) {
    // update escalation details
    await db.query(`
      UPDATE complaints 
      SET escalation_level = 1, 
          escalated_to = 'senioradmin@example.com', 
          escalated_at = NOW(),
          escalation_reason = 'Unresolved > 48 hrs'
      WHERE id = ?
    `, [complaint.id]);

    // notify users/admins (email or alert)
    await sendEscalationNotification(complaint);
  }
}

async function sendEscalationNotification(complaint) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = `
    Complaint ID: ${complaint.id}
    has been escalated to the senior admin because it was unresolved for 48 hours.
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: `${complaint.user_email}, senioradmin@example.com`,
    subject: "Complaint Escalated",
    text: message,
  });
}

module.exports = { checkForEscalations };
