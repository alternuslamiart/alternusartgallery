import nodemailer from "nodemailer";

type VerificationPayload = {
 email: string;
 code: string;
};

type OrderItem = {
 title: string;
 price: number;
 quantity: number;
};

type OrderAddress = {
 address: string;
 city: string;
 postalCode: string;
 country: string;
};

type AdminArtistApplicationPayload = {
 applicantName: string;
 applicantEmail: string;
 location: string;
 memberType: string;
 bio: string;
 artStyles: string[];
 yearsExperience: string;
 portfolioUrl?: string;
};

type AdminOrderPayload = {
 orderNumber: string;
 customerName: string;
 customerEmail: string;
 items: OrderItem[];
 total: number;
 paymentMethod: string;
 shippingAddress: OrderAddress;
};

function getSmtpConfig() {
 const host = process.env.SMTP_HOST?.trim();
 const user = process.env.SMTP_USER?.trim();
 const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
 const port = Number.parseInt(process.env.SMTP_PORT?.trim() || "587", 10);
 const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
 const secure = secureValue ? secureValue === "true" || secureValue === "1" : port === 465;
 const configuredFrom = process.env.SMTP_FROM?.trim();
 const from = host?.toLowerCase().includes("gmail") ? user : configuredFrom || user;

 if (!host || !user || !pass || !from || !Number.isInteger(port)) {
  console.error("[Email] SMTP configuration is incomplete or invalid");
  return null;
 }

 return { host, user, pass, from, port, secure };
}

function createTransport(config: ReturnType<typeof getSmtpConfig>) {
 if (!config) return null;
 const isGmail = config.host.toLowerCase() === "smtp.gmail.com";
 return nodemailer.createTransport(isGmail
  ? {
    service: "gmail",
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 15_000,
   }
  : {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 15_000,
   });
}

export async function sendVerificationEmail(email: string, code: string) {
 const config = getSmtpConfig();
 if (!config) return false;
 const transporter = createTransport(config);
 if (!transporter) return false;

 await transporter.sendMail({
  from: config.from,
  to: email,
  subject: `${code} is your Crystal sign-in code`,
  text: `Your Crystal sign-in code is ${code}. It expires in 10 minutes. Open Crystal Studio: https://www.alternusart.com/login`,
  html: `
   <div style="margin:0;padding:32px 16px;background:#0f0f11;font-family:Roboto,Arial,sans-serif;font-size:12px;line-height:1.6;color:#f4f4f5">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Your secure Crystal Studio sign-in code is ${code}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto">
     <tr><td style="padding:4px 8px 24px">
      <div style="font-size:18px;font-weight:700;letter-spacing:-.03em;color:#fff">
       <span style="display:inline-block;width:24px;height:24px;margin-right:8px;border-radius:7px;background:#1687f7;color:#fff;text-align:center;line-height:24px;vertical-align:middle">◆</span>
       Crystal
      </div>
     </td></tr>
     <tr><td style="padding:0;border:1px solid #303238;border-radius:18px;background:#151618">
      <div style="padding:32px 28px">
       <div style="margin-bottom:14px;color:#8fccff;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase">Crystal Studio workspace</div>
       <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;font-weight:700;letter-spacing:-.04em;color:#fff">Verify your sign-in</h1>
       <p style="margin:0;color:#a1a1aa">Use the verification code below to securely open your Crystal workspace.</p>
       <div style="margin:24px 0;padding:20px 16px;border:1px solid #245b91;border-radius:12px;background:#101c2b;text-align:center">
        <div style="margin-bottom:6px;color:#8a93a1;font-size:10px;letter-spacing:.14em;text-transform:uppercase">Your one-time code</div>
        <div style="color:#fff;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:.28em">${code}</div>
       </div>
       <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px">
        <tr><td style="border-radius:8px;background:#068fff;text-align:center">
         <a href="https://www.alternusart.com/login" style="display:inline-block;padding:12px 24px;border:1px solid #068fff;border-radius:8px;color:#fff;font-size:12px;font-weight:700;text-decoration:none">Open Crystal Studio&nbsp;&nbsp;→</a>
        </td></tr>
       </table>
       <p style="margin:0;color:#71717a;font-size:11px">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
      </div>
     </td></tr>
     <tr><td style="padding:22px 8px 0;color:#52525b;font-size:11px;text-align:center">© Crystal Studio · AI-powered design workspace</td></tr>
    </table>
   </div>
  `,
 });
 return true;
}

export async function sendPasswordResetEmail(email: string, token: string) {
 const config = getSmtpConfig();
 if (!config) return false;
 const resetUrl = `${process.env.NEXTAUTH_URL || "https://www.alternusart.com"}/reset-password?token=${encodeURIComponent(token)}`;
 const transporter = createTransport(config);
 if (!transporter) return false;
 await transporter.sendMail({
  from: config.from,
  to: email,
  subject: "Reset your Crystal password",
  text: `Reset your Crystal password here: ${resetUrl}. This link expires in 1 hour.`,
  html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#111827"><p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#1687f7;font-weight:700">Crystal Studio</p><h1 style="font-size:28px;margin:20px 0 8px">Reset your password</h1><p style="color:#64748b;line-height:1.6">Use the button below to create a new password for your Crystal workspace.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#068fff;color:#fff;text-decoration:none;font-weight:700">Reset password</a></p><p style="font-size:13px;color:#64748b">This link expires in 1 hour. If you did not request it, you can safely ignore this email.</p></div>`,
 });
 return true;
}

export async function sendOrderConfirmationEmail(_payload: unknown) {
 return true;
}

export async function sendAdminNewOrderEmail(_payload: AdminOrderPayload) {
 return true;
}

export async function sendAdminNewArtistApplicationEmail(_payload: AdminArtistApplicationPayload) {
 return true;
}

export async function sendArtistApprovalEmail(_email: string, _name: string) {
 return true;
}

export async function sendArtistRejectionEmail(_email: string, _name: string, _reason: string) {
 return true;
}

export async function sendOrderShippedEmail(_payload: unknown) {
 return true;
}

export async function sendOrderDeliveredEmail(_payload: unknown) {
 return true;
}
