import nodemailer from 'nodemailer';
import config from 'config';

export const sendEmail = async (
  to: string,
  templateName: string,
  subject: string,
  templateVars: Record<string, any> = {},
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.get('fernandoramones92@gmail.com'),
        pass: config.get('obyrebzjzadcwyuq'),
      },
    });

    const emailTemplate = getEmailTemplate(templateName, templateVars);

    const mailOptions: nodemailer.SendMailOptions = {
        from: config.get('fernandoramones92@gmail.com') as string,
        to,
        subject,
        html: emailTemplate,
      };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error(error);
  }
};

const getEmailTemplate = (templateName: string, templateVars: Record<string, any>) => {
  switch (templateName) {
    case 'create-user':
      // Use templateVars to fill in the placeholders in the email template for this type
      return '<p>Welcome to our platform!</p>';
    case 'change-password':
      // Use templateVars to fill in the placeholders in the email template for this type
      return '<p>Your password has been changed.</p>';
    default:
      throw new Error(`Unsupported email template name: ${templateName}`);
  }
};
