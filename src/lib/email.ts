import nodemailer from 'nodemailer';

// Create transporter with SMTP settings
// For production, use a real SMTP service like SendGrid, Mailgun, or Amazon SES
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Alternus Art Gallery" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">Alternus Art Gallery</h1>
          </div>

          <!-- Content -->
          <h2 style="margin: 0 0 15px; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
            Verify Your Email
          </h2>
          <p style="margin: 0 0 30px; color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
            Welcome to Alternus Art Gallery! Please use the verification code below to complete your registration.
          </p>

          <!-- Code Box -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 10px; color: rgba(255,255,255,0.8); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
              Your verification code
            </p>
            <p style="margin: 0; font-size: 36px; font-weight: 700; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </p>
          </div>

          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes.
          </p>
          <p style="margin: 0; color: #999; font-size: 13px; text-align: center;">
            If you didn't create an account with Alternus Art Gallery, you can safely ignore this email.
          </p>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Alternus Art Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Alternus Art Gallery - Email Verification

    Your verification code is: ${code}

    This code will expire in 10 minutes.

    If you didn't create an account with Alternus Art Gallery, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your email - Alternus Art Gallery',
    html,
    text,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000; text-align: center;">
            Welcome to Alternus Art Gallery!
          </h1>
          <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for joining Alternus Art Gallery. We're excited to have you as part of our community of art lovers and collectors.
          </p>
          <p style="margin: 0 0 30px; color: #666; font-size: 16px; line-height: 1.6;">
            Explore our curated collection of unique artworks from talented artists around the world.
          </p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/gallery" style="display: inline-block; padding: 14px 32px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Browse Gallery
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Alternus Art Gallery!',
    html,
  });
}

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
          <div>
            <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${item.title}</p>
            <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        €${item.price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">Alternus Art Gallery</h1>
          </div>

          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 30px;">✓</span>
            </div>
          </div>

          <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
            Order Confirmed!
          </h2>
          <p style="margin: 0 0 30px; color: #666; font-size: 16px; text-align: center;">
            Thank you for your order, ${data.customerName}!
          </p>

          <!-- Order Number -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
            <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">${data.orderNumber}</p>
          </div>

          <!-- Items -->
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <div style="border-top: 2px solid #eee; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Subtotal</span>
              <span style="color: #1a1a1a;">€${data.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Shipping</span>
              <span style="color: #1a1a1a;">${data.shipping === 0 ? 'Free' : `€${data.shipping.toFixed(2)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #666;">Tax (20%)</span>
              <span style="color: #1a1a1a;">€${data.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
              <span style="color: #1a1a1a;">Total</span>
              <span style="color: #1a1a1a;">€${data.total.toFixed(2)}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Shipping Address</h4>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
              ${data.shippingAddress.address}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" style="display: inline-block; padding: 14px 32px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Track Your Order
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Alternus Art Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmed - ${data.orderNumber}`,
    html,
  });
}

// Admin notification when a new order payment is completed
interface AdminOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export async function sendAdminNewOrderEmail(data: AdminOrderNotificationData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL not set — cannot send admin order notification');
    return false;
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee; color: #1a1a1a;">${item.title}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.quantity}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #1a1a1a;">€${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">Alternus Art Gallery</h1>
          </div>

          <!-- Alert Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 30px;">$</span>
            </div>
          </div>

          <h2 style="margin: 0 0 5px; font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center;">
            New Order Received!
          </h2>
          <p style="margin: 0 0 25px; color: #666; font-size: 14px; text-align: center;">
            A customer has just completed a payment.
          </p>

          <!-- Order Info -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #92400e; font-size: 14px;">Order Number</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #92400e; font-size: 14px;">${data.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #92400e; font-size: 14px;">Payment Method</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">${data.paymentMethod.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #92400e; font-size: 14px;">Total</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #92400e; font-size: 18px;">€${data.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Customer Info -->
          <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Customer</h3>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0 0 5px; font-weight: 600; color: #1a1a1a; font-size: 14px;">${data.customerName}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">${data.customerEmail}</p>
          </div>

          <!-- Items -->
          <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #666; font-weight: 600;">Artwork</th>
                <th style="padding: 10px 15px; text-align: center; font-size: 12px; color: #666; font-weight: 600;">Qty</th>
                <th style="padding: 10px 15px; text-align: right; font-size: 12px; color: #666; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Shipping Address -->
          <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Ship To</h3>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
              ${data.shippingAddress.address}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="display: inline-block; padding: 14px 32px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View in Admin Panel
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from Alternus Art Gallery.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `NEW ORDER: ${data.orderNumber}\nCustomer: ${data.customerName} (${data.customerEmail})\nTotal: €${data.total.toFixed(2)}\nPayment: ${data.paymentMethod}\nItems: ${data.items.map(i => i.title).join(', ')}\nShip to: ${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.country}`;

  return sendEmail({
    to: adminEmail,
    subject: `New Order! ${data.orderNumber} — €${data.total.toFixed(2)}`,
    html,
    text,
  });
}

export async function sendOrderShippedEmail(data: OrderEmailData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">Alternus Art Gallery</h1>
          </div>

          <!-- Shipping Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 28px;">📦</span>
            </div>
          </div>

          <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
            Your Order Has Shipped!
          </h2>
          <p style="margin: 0 0 30px; color: #666; font-size: 16px; text-align: center;">
            Great news, ${data.customerName}! Your artwork is on its way.
          </p>

          <!-- Order & Tracking Info -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
              <p style="margin: 5px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${data.orderNumber}</p>
            </div>
            ${data.trackingNumber ? `
            <div>
              <p style="margin: 0; color: #666; font-size: 14px;">Tracking Number</p>
              <p style="margin: 5px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${data.trackingNumber}</p>
            </div>
            ` : ''}
          </div>

          <!-- Shipping Address -->
          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
            <h4 style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Delivering To</h4>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
              ${data.shippingAddress.address}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            ${data.trackingUrl ? `
            <a href="${data.trackingUrl}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
              Track Package
            </a>
            ` : ''}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" style="display: inline-block; padding: 14px 32px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Order
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Alternus Art Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Your Order Has Shipped - ${data.orderNumber}`,
    html,
  });
}

export async function sendOrderDeliveredEmail(data: OrderEmailData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">Alternus Art Gallery</h1>
          </div>

          <!-- Delivered Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 28px;">🎉</span>
            </div>
          </div>

          <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
            Your Order Has Been Delivered!
          </h2>
          <p style="margin: 0 0 30px; color: #666; font-size: 16px; text-align: center;">
            Hi ${data.customerName}, your artwork has arrived! We hope you love it.
          </p>

          <!-- Order Info -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
            <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">${data.orderNumber}</p>
          </div>

          <p style="margin: 0 0 30px; color: #666; font-size: 16px; text-align: center; line-height: 1.6;">
            If you have any questions about your order or need assistance with hanging your artwork, feel free to contact us.
          </p>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/gallery" style="display: inline-block; padding: 14px 32px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Explore More Art
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
              Thank you for supporting independent artists!
            </p>
            <p style="margin: 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Alternus Art Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Order Delivered - ${data.orderNumber}`,
    html,
  });
}
