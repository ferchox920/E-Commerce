import nodemailer from 'nodemailer';
import config from 'config';
import { link } from 'fs';

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
        user: 'fernandoramones92@gmail.com',
        pass:'obyrebzjzadcwyuq',
      },
    });

    const emailTemplate = getEmailTemplate(templateName, templateVars);

    const mailOptions: nodemailer.SendMailOptions = {
        from: 'fernandoramones92@gmail.com',
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
  
        return `<p>Bienvenido a CHE QUE BARATO!</p>
                <p>${templateVars.customerName}</p>
                <p>Gracias por unirte a nosotros. Esperamos que disfrutes de tus compras en nuestra tienda en línea.</p>
                <a href="http://${config.get('host')}:${config.get('port')}/users/verify-email/${templateVars.otp}/${templateVars.customerEmail}">Haz clic aquí para verificar tu correo electrónico</a>
                <p>Para acceder a tu cuenta, utiliza el correo electrónico y la contraseña que proporcionaste al registrarte.</p>
                <p>¡Que tengas un gran día!</p>`;
      case 'change-password':
        // Use templateVars to fill in the placeholders in the email template for this type
        return `<p>Tu contraseña ha sido cambiada exitosamente.</p>
                <p>Si no realizaste este cambio, por favor, contáctanos de inmediato.</p>`;
      case 'forgot-password':
        // Use templateVars to fill in the placeholders in the email template for this type
        return `<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de CHE QUE BARATO.</p>
                <p>Para cambiar tu contraseña, haz clic en el siguiente enlace:</p>
                <p><a href="${templateVars.resetPasswordUrl}">Restablecer mi contraseña</a></p>
                <p>Si no realizaste esta solicitud, ignora este correo electrónico y toma medidas de seguridad adicionales para proteger tu cuenta.</p>`;
      case 'order-success':
        // Use templateVars to fill in the placeholders in the email template for this type
        return `<p>Tu pedido en CHE QUE BARATO ha sido procesado satisfactoriamente.</p>
                <p>Detalles del pedido:</p>
                <ul>
                  <li>Fecha de pedido: ${templateVars.orderDate}</li>
                  <li>Número de pedido: ${templateVars.orderNumber}</li>
                  <li>Artículos pedidos:</li>
                  <ul>
                    ${templateVars.orderItems.map((item: any) => `<li>${item.name} - Cantidad: ${item.quantity}</li>`)}
                  </ul>
                  <li>Total del pedido: ${templateVars.orderTotal}</li>
                </ul>
                <p>Gracias por comprar en CHE QUE BARATO. Esperamos que disfrutes de tus productos.</p>`;
      default:
        throw new Error(`Nombre de template de correo electrónico no soportado: ${templateName}`);
    }
  };
  