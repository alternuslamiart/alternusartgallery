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

export async function sendVerificationEmail(email: string, code: string) {
 const host = process.env.SMTP_HOST;
 const user = process.env.SMTP_USER;
 const pass = process.env.SMTP_PASS;
 const from = process.env.SMTP_FROM || user;

 if (!host || !user || !pass || !from) {
  console.error("[Email] SMTP configuration is incomplete");
  return false;
 }

 const transporter = nodemailer.createTransport({
  host,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user, pass },
 });

 await transporter.sendMail({
  from,
  to: email,
  subject: "Your Crystal verification code",
  text: `Your Crystal verification code is ${code}. It expires in 10 minutes.`,
  html: `
   <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#111827">
    <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#1687f7;font-weight:700">Crystal Studio</p>
    <h1 style="font-size:28px;margin:20px 0 8px">Verify your sign-in</h1>
    <p style="color:#64748b;line-height:1.6">Use this one-time code to securely open your Crystal workspace.</p>
    <div style="margin:28px 0;padding:20px;text-align:center;border:1px solid #dbeafe;border-radius:14px;background:#eff6ff;font-size:32px;letter-spacing:.35em;font-weight:700;color:#0f172a">${code}</div>
    <p style="font-size:13px;color:#64748b">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
   </div>
  `,
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
