import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactEmailData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail(data: ContactEmailData) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Courier New', monospace; line-height: 1.6; color: #333; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; text-transform: uppercase; }
            .footer { border-top: 2px solid #000; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OKYENA COLLECTIVE - NEW CONTACT INQUIRY</h1>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">From:</span> ${data.name} &lt;${data.email}&gt;
            </div>
            
            <div class="field">
              <span class="label">Subject:</span> ${data.subject}
            </div>
            
            <div class="field">
              <span class="label">Message:</span>
              <div style="margin-top: 10px; padding: 15px; background-color: #f5f5f5; border: 1px solid #ddd;">
                ${data.message.replace(/\n/g, "<br>")}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from the Okyena Collective contact form.</p>
            <p>Reply directly to this email to respond to ${data.name}.</p>
            <p>---</p>
            <p>OKYENA COLLECTIVE - DIGITAL HERITAGE ARCHIVE</p>
            <p>Preserving Ghana's cultural heritage through technology</p>
          </div>
        </body>
      </html>
    `

    const emailText = `
OKYENA COLLECTIVE - NEW CONTACT INQUIRY

FROM: ${data.name} <${data.email}>
SUBJECT: ${data.subject}

MESSAGE:
${data.message}

---
This message was sent from the Okyena Collective contact form.
Reply directly to this email to respond to ${data.name}.

OKYENA COLLECTIVE - DIGITAL HERITAGE ARCHIVE
Preserving Ghana's cultural heritage through technology
    `

    const result = await resend.emails.send({
      from: "Okyena Collective <contact@okyenacollective.com>", // You'll need to verify this domain
      to: ["okyena.collective@gmail.com"],
      replyTo: data.email, // This allows you to reply directly to the sender
      subject: `[OKYENA COLLECTIVE] ${data.subject}`,
      html: emailHtml,
      text: emailText,
    })

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }
}

// Auto-reply email to the sender
export async function sendAutoReply(data: ContactEmailData) {
  try {
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Courier New', monospace; line-height: 1.6; color: #333; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .footer { border-top: 2px solid #000; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>THANK YOU FOR CONTACTING OKYENA COLLECTIVE</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>Thank you for reaching out to the Okyena Collective. We have received your message regarding "${data.subject}" and appreciate your interest in our digital heritage preservation work.</p>
            
            <p>Our team will review your inquiry and respond within 24 hours. In the meantime, feel free to explore our digital archive and learn more about our mission to preserve Ghana's rich cultural heritage through cutting-edge 3D technology.</p>
            
            <p><strong>Your Message:</strong></p>
            <div style="margin: 15px 0; padding: 15px; background-color: #f5f5f5; border: 1px solid #ddd;">
              ${data.message.replace(/\n/g, "<br>")}
            </div>
            
            <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
            
            <p>Best regards,<br>
            The Okyena Collective Team</p>
          </div>
          
          <div class="footer">
            <p><strong>OKYENA COLLECTIVE</strong></p>
            <p>Digital Heritage Archive</p>
            <p>Email: okyena.collective@gmail.com</p>
            <p>Website: [Your Website URL]</p>
            <p>---</p>
            <p>Preserving Ghana's cultural heritage through technology</p>
          </div>
        </body>
      </html>
    `

    const autoReplyText = `
THANK YOU FOR CONTACTING OKYENA COLLECTIVE

Dear ${data.name},

Thank you for reaching out to the Okyena Collective. We have received your message regarding "${data.subject}" and appreciate your interest in our digital heritage preservation work.

Our team will review your inquiry and respond within 24 hours. In the meantime, feel free to explore our digital archive and learn more about our mission to preserve Ghana's rich cultural heritage through cutting-edge 3D technology.

Your Message:
${data.message}

If you have any urgent questions, please don't hesitate to contact us directly.

Best regards,
The Okyena Collective Team

---
OKYENA COLLECTIVE
Digital Heritage Archive
Email: okyena.collective@gmail.com
Website: [Your Website URL]

Preserving Ghana's cultural heritage through technology
    `

    await resend.emails.send({
      from: "Okyena Collective <contact@okyenacollective.com>",
      to: [data.email],
      subject: "Thank you for contacting Okyena Collective",
      html: autoReplyHtml,
      text: autoReplyText,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send auto-reply:", error)
    // Don't throw error for auto-reply failure - main email is more important
    return { success: false }
  }
}
