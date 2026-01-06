# 🏥 Sistema de Gestión de Consultorio

Un sistema web moderno para gestionar pacientes, sesiones y historias clínicas en un consultorio de psicología.

## ✨ Características

✅ **Registrar Sesiones** - Agregar nuevas sesiones con datos del paciente  
✅ **Guardar Pacientes Frecuentes** - Guardar clientes recurrentes para acceso rápido  
✅ **Historias Clínicas** - Adjuntar archivos PDF, imágenes o documentos  
✅ **Estadísticas Mensuales** - Ver total, pagado y pendiente del mes actual  
✅ **Gestión de Pagos** - Marcar sesiones como pagado, pendiente o pago parcial  
✅ **Búsqueda y Filtros** - Encontrar pacientes rápidamente  
✅ **Recordatorios por Email** - Notificación automática para cargar historias clínicas  
✅ **Datos en la Nube** - Firebase para almacenamiento seguro  
✅ **Responsive Design** - Funciona en desktop y móvil  

## 🚀 Instalación

### 1. Prerequisitos
- Node.js v14+ instalado
- Navegador moderno (Chrome, Edge, Firefox)
- Cuenta de Gmail o Hotmail para emails

### 2. Instalación del Servidor de Emails

```bash
# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
# EMAIL_USER=tu_email@gmail.com
# EMAIL_PASS=tu_contraseña_de_aplicacion
```

### 3. Configurar Credenciales de Email

**Para Gmail:**
1. Ir a https://myaccount.google.com/apppasswords
2. Seleccionar "Mail" y "Windows Computer" (o tu dispositivo)
3. Copiar la contraseña de 16 caracteres
4. Pegarla en `.env` como `EMAIL_PASS`

**Para Hotmail/Outlook:**
1. Usar tu contraseña de Outlook directamente
2. Cambiar `EMAIL_SERVICE` en el código si es necesario

### 4. Ejecutar el Servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con reload automático)
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 5. Abrir la Aplicación

- Abrir `index.html` en el navegador (doble click o Live Server)
- O usar un servidor local: `npx http-server`

## 📱 Cómo Usar

### Registrar una Nueva Sesión

1. Rellenar los datos del paciente
2. Seleccionar fecha y hora del turno
3. Indicar monto y estado de pago
4. (Opcional) Adjuntar historia clínica (PDF, imagen, etc.)
5. Hacer click en "Registrar Sesión"
6. ✉️ Se enviará un email automático a `conju33@hotmail.com`

### Seleccionar un Paciente Frecuente

1. Los pacientes se guardan automáticamente al registrar una sesión
2. En el formulario, seleccionar del dropdown "Pacientes Frecuentes"
3. Los datos se cargan automáticamente
4. Actualizar solo lo que sea necesario

### Ver Historia Clínica

1. En la lista de sesiones, hacer click en "📄 Ver Historia"
2. Se abrirá una ventana con el archivo
3. Opción para descargar

### Editar una Sesión

1. Hacer click en "Editar"
2. Cambiar los datos necesarios
3. (Opcional) Cargar una nueva historia clínica
4. Guardar cambios

### Ver Estadísticas del Mes

La información aparece en la parte superior de la lista de sesiones:
- **Total Este Mes**: Suma de todos los montos registrados
- **Pagado**: Suma de sesiones con estado "Pagado"
- **Pendiente**: Suma de sesiones pendientes de pago

## 🗄️ Estructura de Datos

### Firebase (Sesiones)
```javascript
{
  nombre: "Juan Pérez",
  email: "juan@email.com",
  telefono: "+54 9 11 1234567",
  fechaTurno: "2026-01-05",
  horaTurno: "14:30",
  monto: 500,
  estadoPago: "pagado",
  notas: "Observaciones de la sesión",
  fechaRegistro: "2026-01-05T14:30:00.000Z",
  clinicalFile: {
    name: "historia.pdf",
    url: "https://...",
    type: "application/pdf",
    uploadDate: "2026-01-05T14:30:00.000Z"
  }
}
```

### LocalStorage (Pacientes Frecuentes)
Los pacientes se guardan localmente en el navegador y se reutilizan.

## 📧 Sistema de Emails

Cuando se registra una sesión, se envía automáticamente un email con:
- ✅ Nombre del paciente
- ✅ Fecha y hora de la sesión
- ✅ Botón directo para cargar historia clínica
- ✅ Enlace a la sesión específica

### Solucionar Problemas de Email

**El email no se envía:**
1. Verificar que el servidor esté ejecutándose (`npm start`)
2. Revisar consola del navegador (F12) para errores
3. Verificar credenciales en `.env`
4. Para Gmail: asegurar que esté habilitada "Apps menos seguras"

**Cambiar destinatario:**
- En `app.js`, línea de `sendEmailNotification()`, cambiar `'conju33@hotmail.com'`
- O en `server.js`, pasar el email dinámicamente

## 🔒 Seguridad

- Firebase maneja autenticación de datos
- Archivos almacenados en Firebase Storage (seguro)
- Variables sensibles en `.env` (no en el código)
- CORS configurado para desarrollo

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: Firebase Realtime Database
- **Storage**: Firebase Storage
- **Email**: Nodemailer
- **Hosting**: Firebase (recomendado para producción)

## 📝 Notas para Electron

Para usar esto en Electron:
1. El servidor debe ejecutarse en background
2. Considerar usar Tauri o embedding Node en Electron
3. O usar un backend en la nube (Firebase Functions)

```javascript
// Ejemplo en Electron
const { spawn } = require('child_process');

const server = spawn('node', ['server.js']);
server.stdout.on('data', (data) => {
  console.log(`Server: ${data}`);
});
```

## 🎨 Personalización

### Cambiar Logo o Nombre
Editar en `index.html`:
```html
<h1>🏥 Gestión de Consultorio</h1>
<p class="subtitle">Psicología</p>
```

### Cambiar Colores
En `styles.css`, buscar:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Agregar Campos
1. Agregar en HTML
2. Agregar en `inputs` en JavaScript
3. Incluir en `newPatient` al guardar

## 📧 Contacto & Soporte

Para dudas o reportar problemas, revisar la consola del navegador (F12).

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026
