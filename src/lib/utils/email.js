import nodemailer from 'nodemailer';
import { ValidationError } from './error';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// E-posta gönderme fonksiyonu
export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('E-posta gönderme denemesi:', {
      from: `"Perseus Defend" <${process.env.SMTP_USER}>`,
      to,
      subject,
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
      }
    });

    const info = await transporter.sendMail({
      from: `"Perseus Defend" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('E-posta başarıyla gönderildi:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('E-posta gönderme hatası:', {
      error: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    throw new ValidationError(`E-posta gönderilemedi: ${error.message}`);
  }
};

// E-posta gönderme fonksiyonu
export const sendVerificationEmail = async (email, code, type, options = {}) => {
  try {
    const templates = {
      EMAIL_VERIFY: {
        subject: 'E-posta Doğrulama Kodu - Perseus Defend',
        title: 'E-posta Doğrulama',
        message: 'E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:',
        template: (code) => `
          <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0;">Merhaba,</p>
            <p style="margin: 0 0 15px 0;">E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>

            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2d3748;">${code}</span>
            </div>

            <p style="margin: 0 0 15px 0; font-size: 14px; color: #718096;">Bu kod 2 dakika süreyle geçerlidir.</p>
          </div>
        `,
      },
      PASSWORD_RESET: {
        subject: 'Şifre Sıfırlama - Perseus Defend',
        title: 'Şifre Sıfırlama',
        message: 'Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:',
        template: (code) => {
          const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?code=${code}`;
          return `
            <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px 0;">Merhaba,</p>
              <p style="margin: 0 0 15px 0;">Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Şifremi Sıfırla
                </a>
              </div>

              <p style="margin: 0 0 15px 0; font-size: 14px; color: #718096;">Bu bağlantı 15 dakika süreyle geçerlidir.</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #718096;">Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
          `;
        },
      },
      TWO_FACTOR: {
        subject: 'İki Faktörlü Doğrulama Kodu - Perseus Defend',
        title: 'İki Faktörlü Doğrulama',
        message: 'Giriş yapmak için aşağıdaki kodu kullanın:',
        template: (code) => `
          <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0;">Merhaba,</p>
            <p style="margin: 0 0 15px 0;">Giriş yapmak için aşağıdaki kodu kullanın:</p>

            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2d3748;">${code}</span>
            </div>

            <p style="margin: 0 0 15px 0; font-size: 14px; color: #718096;">Bu kod 2 dakika süreyle geçerlidir.</p>
          </div>
        `,
      },
      PIN_VERIFY: {
        subject: 'PIN Doğrulama Kodu - Perseus Defend',
        title: 'PIN Doğrulama',
        message: 'PIN doğrulaması için aşağıdaki kodu kullanın:',
        template: (code) => `
          <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0;">Merhaba,</p>
            <p style="margin: 0 0 15px 0;">PIN doğrulaması için aşağıdaki kodu kullanın:</p>

            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2d3748;">${code}</span>
            </div>

            <p style="margin: 0 0 15px 0; font-size: 14px; color: #718096;">Bu kod 2 dakika süreyle geçerlidir.</p>
          </div>
        `,
      },
      DEMO_REQUEST: {
        subject: 'Yeni Demo Talebi - Perseus Defend',
        title: 'Yeni Demo Talebi',
        message: 'Yeni bir demo talebi alındı.',
        template: (code, options) => {
          const approveUrl = `${process.env.NEXTAUTH_URL}/api/admin/demo-requests/${options.requestId}/approve`;
          const rejectUrl = `${process.env.NEXTAUTH_URL}/api/admin/demo-requests/${options.requestId}/reject`;

          return `
            <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px 0;">Yeni bir demo talebi alındı.</p>
              <p style="margin: 0 0 15px 0;">E-posta: ${options.email}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${approveUrl}" style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-right: 10px;">Onayla</a>
                <a href="${rejectUrl}" style="background-color: #f56565; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reddet</a>
              </div>
            </div>
          `;
        },
      },
      CONTACT_FORM: {
        subject: 'Yeni İletişim Formu Mesajı - Perseus Defend',
        title: 'Yeni İletişim Mesajı',
        message: 'Yeni bir iletişim formu mesajı alındı.',
        template: (code, options) => {
          return `
            <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 20px 0; color: #2d3748;">Yeni İletişim Formu Mesajı</h3>
              
              <div style="margin-bottom: 15px;">
                <strong>Ad:</strong> ${options.firstName}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Soyad:</strong> ${options.lastName}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>E-posta:</strong> ${options.email}
              </div>
              
              ${options.companyName ? `
                <div style="margin-bottom: 15px;">
                  <strong>Şirket Adı:</strong> ${options.companyName}
                </div>
              ` : ''}
              
              ${options.phoneNumber ? `
                <div style="margin-bottom: 15px;">
                  <strong>Telefon:</strong> ${options.phoneNumber}
                </div>
              ` : ''}
              
              <div style="margin-bottom: 15px;">
                <strong>Mesaj:</strong>
                <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; margin-top: 5px;">
                  ${options.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #718096;">
                <strong>Mesaj ID:</strong> ${options.contactId}<br>
                <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}
              </div>
            </div>
          `;
        },
      },
    };

    const template = templates[type];
    if (!template) {
      throw new ValidationError('Geçersiz e-posta tipi');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d3748; margin: 0; font-size: 24px;">${template.title}</h1>
            </div>

            ${template.template(code, options)}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; color: #718096;">Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #a0aec0;">
            <p style="margin: 0;">© 2024 Perseus Defend. Tüm hakları saklıdır.</p>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: type === 'DEMO_REQUEST' || type === 'CONTACT_FORM' ? process.env.ADMIN_EMAIL : email,
      subject: template.subject,
      html,
    });
  } catch (error) {
    throw new ValidationError('E-posta gönderilemedi');
  }
}; 