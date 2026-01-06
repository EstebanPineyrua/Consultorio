require('dotenv').config(); // Línea 1 indispensable
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

console.log("--- TEST DE VARIABLES ---");
console.log("¿Existe el usuario?:", process.env.EMAIL_USER ? "SÍ" : "NO");
console.log("Valor leído:", process.env.EMAIL_USER);
console.log("-------------------------");

const app = express();
//Puerto de escucha
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());

// Configuración del transporte para Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

app.post('/send-email', async (req, res) => {
    try {
        const { email, patientName, appointmentDate, appointmentTime, sessionId } = req.body;

        const mailOptions = {
            from: process.env.FROM_EMAIL, // El correo de Mailtrap 
            to: email,
            subject: `Recordatorio: Carga Historia Clínica - ${patientName}`,
            html: `
                <h2>Recordatorio de Carga de Historia Clínica</h2>
                <p>Se ha completado una sesión con el paciente <strong>${patientName}</strong></p>
                <p><strong>Fecha de la sesión:</strong> ${appointmentDate} ${appointmentTime}</p>
                <p>Por favor, carga la historia clínica del paciente en la plataforma.</p>
                <br>
                <a href="https://estebanpineyrua.github.io/Consultorio/index.html?session=${sessionId}"
                   style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                    📄 Cargar Historia Clínica
                </a>
                <p style="margin-top: 20px; color: #666; font-size: 12px;">
                    Sistema de Gestión de Consultorio
                </p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor de emails funcionando', user: process.env.EMAIL_USER });
});

app.listen(PORT, () => {
    console.log("✅ Servidor de emails ejecutándose en https://consultorio-rt8n.onrender.com");
    console.log('📧 Configuración de email:');
    console.log(`   - Usuario: ${process.env.EMAIL_USER || 'No configurado'}`);
});