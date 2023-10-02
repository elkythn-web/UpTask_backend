import nodemailer from 'nodemailer'


export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <mailto@uptask.com>',
        to: email,
        subject: "Confirma tu cuenta UpTask",
        text: "Confirma tu cuenta UpTask",
        html: `
        <p>Hola: ${nombre} por favor comprueba tu cuenta</p>

        <p>Da click en el siguiente enlace para confirmar tu cuenta</p>

        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>
        
        <p>Si no has sido tu, ignora este correo</p>
        `,
    });
}

export const emailRecuperacion = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  const info = await transport.sendMail({
      from: '"UpTask - Administrador de Proyectos" <mailto@uptask.com>',
      to: email,
      subject: "Restablece tu contraseña UpTask",
      text: "UpTask - Restablece tu contraseña",
      html: `
      <p>Hola: ${nombre} este email ha sido enviado para restablecer tu contrasena</p>

      <p>Da click en el siguiente enlace para restablecer tu contrasena</p>

      <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer tu contrasena</a>
      
      <p>Si no has sido tu, ignora este correo</p>
      `,
  });
}

