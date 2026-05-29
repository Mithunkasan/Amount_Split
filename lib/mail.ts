import nodemailer from "nodemailer";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Setup transporter dynamically from .env values
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  // Return a configured transporter
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use SSL/TLS for port 465, STARTTLS for 587
    auth: {
      user,
      pass,
    },
    // We add tls rejection bypass options to ensure ease of local/sandbox testing
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Sends a premium styled invitation email to an invited member
 * @param toEmail Email of the invitee
 * @param groupName Name of the expense group
 * @param inviteLink Unique URL containing the invitation token
 * @param leaderName Name of the team leader initiating the invitation
 */
export async function sendInvitationEmail(
  toEmail: string,
  groupName: string,
  inviteLink: string,
  leaderName: string
): Promise<boolean> {
  const fromName = process.env.SMTP_FROM_NAME || "TripSplit";
  const fromUser = process.env.SMTP_USER || "";

  const transporter = createTransporter();

  // Premium, wowed-on-first-glance HTML template with custom styling, pink-rose gradients, and glassmorphic container aesthetics
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to TripSplit!</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0d0106;
          color: #fff0f3;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .wrapper {
          width: 100%;
          background-color: #0d0106;
          padding: 40px 0;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: rgba(24, 4, 13, 0.85);
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .header {
          background: linear-gradient(135deg, #1f0514 0%, #0d0106 100%);
          padding: 30px 40px;
          text-align: center;
          border-bottom: 1px solid rgba(236, 72, 153, 0.15);
        }
        .logo {
          font-size: 24px;
          font-weight: 900;
          color: #ec4899;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-decoration: none;
        }
        .content {
          padding: 40px;
          text-align: center;
        }
        h1 {
          font-size: 22px;
          font-weight: 800;
          margin-top: 0;
          margin-bottom: 20px;
          color: #fff0f3;
        }
        p {
          font-size: 14px;
          line-height: 1.6;
          color: #f472b6;
          margin-bottom: 25px;
        }
        .group-highlight {
          display: inline-block;
          padding: 12px 24px;
          background: rgba(236, 72, 153, 0.1);
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 12px;
          font-size: 18px;
          font-weight: 900;
          color: #fff0f3;
          margin: 15px 0 30px 0;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.05);
        }
        .btn-container {
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          color: #1a0410 !important;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
          transition: all 0.2s ease-in-out;
        }
        .footer {
          background-color: #1a0410;
          padding: 20px 40px;
          text-align: center;
          font-size: 11px;
          color: #843b66;
          border-top: 1px solid rgba(236, 72, 153, 0.1);
        }
        .footer a {
          color: #ec4899;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <span class="logo">TripSplit</span>
          </div>
          <div class="content">
            <h1>You're Invited!</h1>
            <p>Hello,</p>
            <p><strong>${leaderName}</strong> has added you to their expense sharing trip group on TripSplit:</p>
            
            <div class="group-highlight">
              ${groupName}
            </div>
            
            <p>Click the link below to accept the invitation and view all the details, splits, and current expense items log for this group!</p>
            
            <div class="btn-container">
              <a href="${inviteLink}" class="btn" target="_blank">View Expenses & Join Group</a>
            </div>
            
            <p style="font-size: 12px; color: #a15882; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${inviteLink}" style="color: #ec4899; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>
          <div class="footer">
            &copy; 2026 TripSplit. Secure splits made simple.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${fromName}" <${fromUser}>`,
    to: toEmail,
    subject: `You've been added to "${groupName}" on TripSplit`,
    html: htmlContent,
  };

  console.log(`\n======================================================`);
  console.log(`[SMTP] GENERATED INVITATION LINK FOR: ${toEmail}`);
  console.log(`👉 Link: ${inviteLink}`);
  console.log(`======================================================\n`);

  try {
    console.log(`[SMTP] Preparing to send email transport via ${(transporter.options as any).host}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Invitation email sent successfully to ${toEmail}! MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP] Error encountered while sending email to ${toEmail}:`, error);
    console.log(`[SMTP] Fallback: Please copy the link above manually to test!`);
    return false;
  }
}
