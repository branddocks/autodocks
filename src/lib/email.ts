/**
 * Email utility — sends transactional emails via Resend REST API.
 *
 * Env vars required:
 *   RESEND_API_KEY  — get from https://resend.com (free tier: 100 emails/day)
 *   RESEND_FROM     — verified sender address, e.g. "AutoDocks <hello@autodocks.app>"
 *
 * Falls back to console.log if RESEND_API_KEY is not set (dev mode).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.RESEND_FROM ?? "AutoDocks <hello@autodocks.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.branddocks.com";

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[email] No RESEND_API_KEY — skipping email to ${opts.to}: "${opts.subject}"`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend error ${res.status}: ${body}`);
    } else {
      console.log(`[email] Sent "${opts.subject}" to ${opts.to}`);
    }
  } catch (err) {
    // Never crash the caller due to email failure
    console.error(`[email] Failed to send email: ${err}`);
  }
}

// ─── Template helpers ──────────────────────────────────────────────────────────

function wrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0;padding:0;background:#0d0d0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#D4764E;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                        <span style="color:white;font-size:16px;font-weight:bold;">⚡</span>
                      </td>
                      <td style="padding-left:10px;">
                        <span style="color:white;font-weight:700;font-size:16px;">AutoDocks</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;">
                    Built by <a href="https://branddocks.com" style="color:#D4764E;text-decoration:none;">Brand Docks</a> · Junagadh, India<br />
                    <a href="${APP_URL}/settings" style="color:rgba(255,255,255,0.3);text-decoration:underline;">Manage account</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#D4764E;color:white;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:8px;">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 12px;color:white;font-size:22px;font-weight:700;line-height:1.3;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;">${text}</p>`;
}

// ─── Exported email senders ────────────────────────────────────────────────────

/**
 * Welcome email — sent when a new user signs up.
 */
export async function sendWelcomeEmail(opts: { to: string; name: string }): Promise<void> {
  const firstName = opts.name.split(" ")[0] || "there";
  await sendEmail({
    to: opts.to,
    subject: "Welcome to AutoDocks — you're in 🎉",
    html: wrapper(`
      ${h1(`Welcome, ${firstName}!`)}
      ${p("Your 7-day free trial has started. You can add up to 3 clients, generate AI content calendars, and schedule Instagram posts — all from one dashboard.")}
      ${p("Here's how to get started in the next 5 minutes:")}
      <ol style="margin:0 0 20px;padding-left:20px;color:rgba(255,255,255,0.65);font-size:14px;line-height:2;">
        <li>Add your first client (brand colors, tone, content pillars)</li>
        <li>Generate a content calendar — AI creates 30 days of posts</li>
        <li>Review & approve posts, then let AutoDocks handle the rest</li>
      </ol>
      ${btn("Go to Dashboard", `${APP_URL}/dashboard`)}
      <p style="margin-top:24px;color:rgba(255,255,255,0.35);font-size:13px;">Trial ends in 7 days. No credit card required. Upgrade anytime in Settings.</p>
    `),
  });
}

/**
 * Trial ending warning — sent when 2 days remain on the trial.
 */
export async function sendTrialEndingEmail(opts: {
  to: string;
  name: string;
  daysLeft: number;
}): Promise<void> {
  const firstName = opts.name.split(" ")[0] || "there";
  const dayWord = opts.daysLeft === 1 ? "1 day" : `${opts.daysLeft} days`;
  await sendEmail({
    to: opts.to,
    subject: `Your AutoDocks trial ends in ${dayWord}`,
    html: wrapper(`
      ${h1(`Your trial ends in ${dayWord}`)}
      ${p(`Hey ${firstName}, your free trial is almost over. Don't lose your clients and content — upgrade now to keep everything.`)}
      ${p("Plans start at ₹499/month — that's less than a single Instagram boost.")}
      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;">
        <tr style="background:rgba(255,255,255,0.03);">
          <td style="padding:12px 16px;color:white;font-weight:600;font-size:14px;">Starter</td>
          <td style="padding:12px 16px;color:#D4764E;font-weight:700;font-size:14px;text-align:right;">₹499/month</td>
        </tr>
        <tr style="background:rgba(212,118,78,0.08);border-top:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px 16px;color:white;font-weight:600;font-size:14px;">Pro</td>
          <td style="padding:12px 16px;color:#D4764E;font-weight:700;font-size:14px;text-align:right;">₹999/month</td>
        </tr>
      </table>
      ${btn("Choose a Plan →", `${APP_URL}/settings`)}
      <p style="margin-top:20px;color:rgba(255,255,255,0.35);font-size:13px;">You can upgrade directly in Settings. Payments via UPI, cards, and net banking.</p>
    `),
  });
}

/**
 * Payment failed — sent when Razorpay fires payment.failed webhook.
 */
export async function sendPaymentFailedEmail(opts: { to: string; name: string }): Promise<void> {
  const firstName = opts.name.split(" ")[0] || "there";
  await sendEmail({
    to: opts.to,
    subject: "Action required: AutoDocks payment failed",
    html: wrapper(`
      ${h1("Your payment didn't go through")}
      ${p(`Hey ${firstName}, we couldn't process your last AutoDocks payment. This can happen due to insufficient funds, expired cards, or bank-side blocks.`)}
      ${p("Razorpay will retry automatically. You can also update your payment method or subscribe again from your settings.")}
      ${btn("Update Payment Method", `${APP_URL}/settings`)}
      <p style="margin-top:20px;color:rgba(255,255,255,0.35);font-size:13px;">Need help? Email us at <a href="mailto:support@autodocks.app" style="color:#D4764E;">support@autodocks.app</a></p>
    `),
  });
}
