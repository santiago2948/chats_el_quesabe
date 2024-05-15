const { createTransport } = require("nodemailer");

class EmailSender {
  constructor() {
    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: 'elquesabe04@gmail.com',
          pass: 'tdxe wjxg pkmi ychc'
      } 
    });
  }
  
  
  async sendClientTokenNewService(email, token) { 
    try{
        const htmlBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reestablecimiento de contraseña</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: #fff;
              border-radius: 10px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .purple{
              color: #3D00B7;
            }
            h1 {
              margin-bottom: 20px;
            }
            p {
              color: #000;
              margin-bottom: 20px;
            }

            h2, h3, h1, h4{
              margin: 1.5em 0;
            }

            .blue{
              color: #55ACEE;;
            }

          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="purple">Nuevo servicio generado</h1>
            <h2>¡Hola! se ha generado un nuevo servicio para ti.</h2>
            <h4>A continuación, encontrarás un codigo con el cual podras verificar la identidad de tu freelancer.</h4>
            <h4>Equipo El Que Sabe.</h4>
            <h2 class="blue">${token}</h2>
            <div>
              <p>Si no hiciste esta petición, por favor haz caso omiso.</p>
              <p style="text-align: center; margin-top: 1em;">El que sabe 2024</p>
            </div>
          </div>
        </body>
        </html>
        `;

        const info = await this.transporter.sendMail({
            from: '"El Que Sabe"',
            to: email,
            subject: "Nuevo servicio El Que Sabe",
            html: htmlBody,
        });

        console.log("ID del mensaje:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        throw error;
    }
  }

  async sendFreelancerTokenNewService(email, token) { 
    try{
        const htmlBody = `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reestablecimiento de contraseña</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #fff;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .purple{
                color: #3D00B7;
              }
              h1 {
                margin-bottom: 20px;
              }
              p {
                color: #000;
                margin-bottom: 20px;
              }

              h2, h3, h1, h4{
                margin: 1.5em 0;
              }

              .blue{
                color: #55ACEE;;
              }

            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="purple">Nuevo servicio generado</h1>
              <h2>¡Hola! tienes un nuevo servicio generado.</h2>
              <h4>A continuación, encontrarás un codigo el cual deberas enseñar a tu cliente para confirmar tu identidad.</h4>
              <h2 class="blue">${token}</h2>
              <h4>Equipo El Que Sabe.</h4>
              <div>
                <p style="text-align: center; margin-top: 1em;">El que sabe 2024</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const info = await this.transporter.sendMail({
            from: '"El Que Sabe"',
            to: email,
            subject: "Nuevo servicio El Que Sabe",
            html: htmlBody,
        });

        console.log("ID del mensaje:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        throw error;
    }
  }
}

module.exports = EmailSender;
