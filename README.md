# 🏥 Gestión de Consultorio

Una aplicación web moderna para gestionar sesiones, pacientes, historias clínicas y pagos en un consultorio de psicología. Integrada con Firebase para almacenamiento en tiempo real y Node.js para notificaciones por email.

## ✨ Características Principales

- ✅ **Registrar Sesiones** - Agregar nuevas sesiones con todos los detalles del paciente
- ✅ **Pacientes Frecuentes** - Guardar clientes recurrentes para acceso rápido
- ✅ **Historias Clínicas** - Adjuntar archivos (PDF, imágenes, documentos)
- ✅ **Estadísticas Mensuales** - Ver total, pagado y pendiente del mes actual
- ✅ **Gestión de Pagos** - Estados: Pendiente, Pagado, Pago Parcial
- ✅ **Búsqueda Avanzada** - Filtrar por nombre, email o teléfono
- ✅ **Recordatorios Email** - Notificación automática para cargar historias clínicas
- ✅ **Editar y Eliminar** - Modificar o borrar sesiones
- ✅ **Interfaz Responsiva** - Funciona en desktop, tablet y móvil
- ✅ **Sincronización en Tiempo Real** - Firebase Realtime Database

## 📋 Requisitos

- Node.js v14+ (para servidor de emails)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Cuenta de Gmail o Outlook (para notificaciones)
- Conexión a internet

## 🚀 Instalación Rápida

### 1. Descargar archivos
```bash
git clone <tu-repo>
cd Consultorio
```

### 2. Instalar servidor de emails
```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Iniciar servidor
```bash
npm start
# O para desarrollo con reload automático:
npm run dev
```

### 4. Abrir la aplicación
- Opción 1: Doble click en `index.html`
- Opción 2: `npx http-server` (si tienes Node instalado)
- Opción 3: Live Server en VS Code

## 🔧 Configuración de Email

### Para Gmail:
1. Ir a https://myaccount.google.com/apppasswords
2. Seleccionar "Mail" y "Windows Computer"
3. Copiar contraseña de 16 caracteres
4. Pegar en `.env` como `EMAIL_PASS`

### Para Hotmail/Outlook:
1. Usar tu contraseña directamente
2. Cambiar `service` en `server.js` si es necesario

## 📖 Cómo Usar

### Registrar una Nueva Sesión
1. Completa el formulario con los datos del paciente o selecciona uno frecuente
2. Adjunta historia clínica si corresponde
3. Haz click en "Registrar Sesión"
4. Se enviará un email automático a `tumail` para recordatorio

### Ver, Editar o Eliminar Sesiones
- Usa los botones en cada tarjeta de sesión
- Puedes ver la historia clínica adjunta, editar datos o eliminar la sesión

### Estadísticas del Mes
- Se muestran arriba de la lista de sesiones: total, pagado y pendiente

## 📊 Estructura de los Datos

Cada sesión contiene:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "+54 9 11 1234567",
  "fechaTurno": "2026-01-15",
  "horaTurno": "10:30",
  "monto": 500.00,
  "estadoPago": "pendiente",
  "notas": "Revisión general",
  "fechaRegistro": "2026-01-05T10:30:00.000Z",
  "clinicalFile": {
    "name": "historia.pdf",
    "url": "https://...",
    "type": "application/pdf",
    "uploadDate": "2026-01-05T10:30:00.000Z"
  }
}
```

## 🛠️ Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: Firebase Realtime Database
- **Storage**: Firebase Storage
- **Email**: Nodemailer

## 📝 Notas para Electron
- El servidor debe ejecutarse en background
- O usar un backend en la nube (Firebase Functions)

---

**Versión**: 2.0  
**Última actualización**: 5 de enero de 2026
