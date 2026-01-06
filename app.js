import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAD5rvh7_c3KpVeGAkxOqveRlSuFGoo1EE",
    authDomain: "consultorio-60cf0.firebaseapp.com",
    databaseURL: "https://consultorio-60cf0-default-rtdb.firebaseio.com",
    projectId: "consultorio-60cf0",
    storageBucket: "consultorio-60cf0.firebasestorage.app",
    messagingSenderId: "533233066862",
    appId: "1:533233066862:web:f1df55c12defd8030e177f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// DOM Elements
const patientForm = document.getElementById('patientForm');
const patientsList = document.getElementById('patientsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('editModal');
const viewModal = document.getElementById('viewModal');
const closeBtn = document.querySelector('.close');
const viewModalClose = document.getElementById('viewModalClose');
const cancelBtn = document.getElementById('cancelBtn');
const editForm = document.getElementById('editForm');
const frequentPatient = document.getElementById('frequentPatient');
const clinicalFileInput = document.getElementById('clinicalFile');
const fileNameDisplay = document.getElementById('fileName');
const editClinicalFileInput = document.getElementById('editClinicalFile');
const editFileNameDisplay = document.getElementById('editFileName');

// Store patients data
let allPatients = {};
let filteredPatients = {};
let frequentPatients = {};
let selectedFile = null;
let editSelectedFile = null;

// Form inputs
const inputs = {
    patientName: document.getElementById('patientName'),
    patientEmail: document.getElementById('patientEmail'),
    patientPhone: document.getElementById('patientPhone'),
    appointmentDate: document.getElementById('appointmentDate'),
    appointmentTime: document.getElementById('appointmentTime'),
    amount: document.getElementById('amount'),
    paymentStatus: document.getElementById('paymentStatus'),
    notes: document.getElementById('notes')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
    loadFrequentPatients();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    patientForm.addEventListener('submit', handleAddPatient);
    searchInput.addEventListener('input', handleSearch);
    closeBtn.addEventListener('click', closeModal);
    viewModalClose.addEventListener('click', closeViewModal);
    cancelBtn.addEventListener('click', closeModal);
    editForm.addEventListener('submit', handleEditPatient);
    frequentPatient.addEventListener('change', handleFrequentPatientSelect);
    clinicalFileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        fileNameDisplay.textContent = selectedFile ? selectedFile.name : 'Ningún archivo seleccionado';
    });
    editClinicalFileInput.addEventListener('change', (e) => {
        editSelectedFile = e.target.files[0];
        editFileNameDisplay.textContent = editSelectedFile ? editSelectedFile.name : 'Ningún archivo seleccionado';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === viewModal) {
            closeViewModal();
        }
    });
}

// Load patients from Firebase
function loadPatients() {
    const patientsRef = ref(database, 'sesiones');
    
    onValue(patientsRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            allPatients = data;
            filteredPatients = data;
            displayPatients(data);
            calculateMonthlyStats();
        } else {
            allPatients = {};
            filteredPatients = {};
            displayEmptyState();
            updateMonthlyStats(0, 0, 0);
        }
        
        loadingSpinner.style.display = 'none';
    }, (error) => {
        console.error('Error loading data:', error);
        loadingSpinner.innerHTML = `<p style='color:red;font-weight:bold;'>Error al cargar los datos de Firebase:<br>${error.message || error}</p><p>Revisa la consola del navegador (F12) para más detalles.</p>`;
    });
}

// Load frequent patients from localStorage
function loadFrequentPatients() {
    const stored = localStorage.getItem('frequentPatients');
    if (stored) {
        frequentPatients = JSON.parse(stored);
        populateFrequentPatientSelect();
    }
}

// Populate frequent patient select
function populateFrequentPatientSelect() {
    frequentPatient.innerHTML = '<option value="">-- Nuevo Paciente --</option>';
    Object.entries(frequentPatients).forEach(([id, patient]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = patient.nombre;
        frequentPatient.appendChild(option);
    });
}

// Handle frequent patient selection
function handleFrequentPatientSelect(e) {
    const patientId = e.target.value;
    if (!patientId) {
        inputs.patientName.value = '';
        inputs.patientEmail.value = '';
        inputs.patientPhone.value = '';
        return;
    }
    
    const patient = frequentPatients[patientId];
    inputs.patientName.value = patient.nombre;
    inputs.patientEmail.value = patient.email || '';
    inputs.patientPhone.value = patient.telefono || '';
}

// Handle add patient
function handleAddPatient(e) {
    e.preventDefault();
    
    const newPatient = {
        nombre: inputs.patientName.value.trim(),
        email: inputs.patientEmail.value.trim(),
        telefono: inputs.patientPhone.value.trim(),
        fechaTurno: inputs.appointmentDate.value,
        horaTurno: inputs.appointmentTime.value,
        monto: parseFloat(inputs.amount.value),
        estadoPago: inputs.paymentStatus.value,
        notas: inputs.notes.value.trim(),
        fechaRegistro: new Date().toISOString(),
        clinicalFile: null
    };

    // Validate required fields
    if (!newPatient.nombre || !newPatient.fechaTurno || !newPatient.horaTurno || !newPatient.monto) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    // Add to localStorage as frequent patient
    if (inputs.patientName.value.trim()) {
        const patientId = Date.now().toString();
        frequentPatients[patientId] = {
            nombre: newPatient.nombre,
            email: newPatient.email,
            telefono: newPatient.telefono
        };
        localStorage.setItem('frequentPatients', JSON.stringify(frequentPatients));
        populateFrequentPatientSelect();
    }

    // Upload file if exists
    if (selectedFile) {
        const fileRef = storageRef(storage, `historias/${Date.now()}_${selectedFile.name}`);
        uploadBytes(fileRef, selectedFile)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            })
            .then((url) => {
                newPatient.clinicalFile = {
                    name: selectedFile.name,
                    url: url,
                    type: selectedFile.type,
                    uploadDate: new Date().toISOString()
                };
                savePaciente(newPatient);
            })
            .catch((error) => {
                console.error('Error uploading file:', error);
                showNotification('Error al subir la historia clínica', 'error');
            });
    } else {
        savePaciente(newPatient);
    }
}

function savePaciente(newPatient) {
    // Add to Firebase
    const patientsRef = ref(database, 'sesiones');
    push(patientsRef, newPatient)
        .then((newRef) => {
            const sessionId = newRef.key;
            // Send email notification
            sendEmailNotification(newPatient, sessionId);
            showNotification('Sesión registrada exitosamente', 'success');
            patientForm.reset();
            selectedFile = null;
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            frequentPatient.value = '';
        })
        .catch((error) => {
            console.error('Error adding patient:', error);
            showNotification('Error al registrar la sesión', 'error');
        });
}

// Display patients
function displayPatients(patients) {
    patientsList.innerHTML = '';
    
    if (Object.keys(patients).length === 0) {
        displayEmptyState();
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by date descending
    const sortedEntries = Object.entries(patients).sort((a, b) => {
        return new Date(b[1].fechaRegistro) - new Date(a[1].fechaRegistro);
    });
    
    sortedEntries.forEach(([id, patient]) => {
        const card = createPatientCard(id, patient);
        patientsList.appendChild(card);
    });
}

// Create patient card
function createPatientCard(id, patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    
    const appointmentDateTime = formatDateTime(patient.fechaTurno, patient.horaTurno);
    const badgeClass = `badge-${patient.estadoPago}`;
    const badgeText = capitalizeFirst(patient.estadoPago);
    
    const clinicalFileButton = patient.clinicalFile ? 
        `<button class="btn btn-view" onclick="viewClinicalFile('${id}')">📄 Ver Historia</button>` : 
        '';
    
    // Botón finalizar sesión solo si no está finalizada
    const finalizarBtn = !patient.finalizada ? `<button class="btn btn-finish" onclick="finalizarSesion('${id}')">Finalizar Sesión</button>` : '<span class="badge-finalizada">Finalizada</span>';
    
    card.innerHTML = `
        <div class="patient-header">
            <div class="patient-name">${escapeHtml(patient.nombre)}</div>
            <span class="patient-badge ${badgeClass}">${badgeText}</span>
        </div>
        
        <div class="patient-details">
            <div class="detail-item">
                <span class="detail-label">📧 Email</span>
                <span class="detail-value">${patient.email ? escapeHtml(patient.email) : 'No especificado'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">📞 Teléfono</span>
                <span class="detail-value">${patient.telefono ? escapeHtml(patient.telefono) : 'No especificado'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">📅 Turno</span>
                <span class="detail-value">${appointmentDateTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">💰 Monto</span>
                <span class="detail-value">${formatMoney(patient.monto)}</span>
            </div>
        </div>
        
        ${patient.notas ? `<div class="patient-notes">📝 ${escapeHtml(patient.notas)}</div>` : ''}
        
        <div class="patient-actions">
            ${clinicalFileButton}
            <button class="btn btn-edit" onclick="editPatient('${id}')">Editar</button>
            <button class="btn btn-delete" onclick="deletePatient('${id}')">Eliminar</button>
            ${finalizarBtn}
        </div>
    `;
    
    return card;
}

window.finalizarSesion = function(id) {
    const patient = allPatients[id];
    if (!patient || patient.finalizada) return;
    if (!confirm('¿Seguro que deseas finalizar la sesión? Se enviará el recordatorio para cargar la historia clínica.')) return;
    
    // Marcar como finalizada y enviar mail
    const updatedPatient = { ...patient, finalizada: true };
    const patientRef = ref(database, `sesiones/${id}`);
    update(patientRef, updatedPatient)
        .then(() => {
            sendEmailNotification(updatedPatient, id);
            showNotification('Sesión finalizada y mail enviado', 'success');
        })
        .catch((error) => {
            showNotification('Error al finalizar la sesión', 'error');
        });
}

// Display empty state
function displayEmptyState() {
    patientsList.innerHTML = '';
    emptyState.style.display = 'block';
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredPatients = allPatients;
    } else {
        filteredPatients = {};
        Object.entries(allPatients).forEach(([id, patient]) => {
            if (patient.nombre.toLowerCase().includes(searchTerm) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
                (patient.telefono && patient.telefono.includes(searchTerm))) {
                filteredPatients[id] = patient;
            }
        });
    }
    
    displayPatients(filteredPatients);
}

// Edit patient
window.editPatient = function(id) {
    const patient = allPatients[id];
    if (!patient) return;
    
    document.getElementById('editPatientId').value = id;
    document.getElementById('editPatientName').value = patient.nombre;
    document.getElementById('editPatientEmail').value = patient.email || '';
    document.getElementById('editPatientPhone').value = patient.telefono || '';
    document.getElementById('editAppointmentDate').value = patient.fechaTurno;
    document.getElementById('editAppointmentTime').value = patient.horaTurno;
    document.getElementById('editAmount').value = patient.monto;
    document.getElementById('editPaymentStatus').value = patient.estadoPago;
    document.getElementById('editNotes').value = patient.notas || '';
    
    // Show current file info
    const currentFileInfo = document.getElementById('currentFileInfo');
    if (patient.clinicalFile) {
        currentFileInfo.textContent = `Archivo actual: ${patient.clinicalFile.name}`;
        currentFileInfo.style.color = '#4caf50';
    } else {
        currentFileInfo.textContent = '';
    }
    
    editSelectedFile = null;
    editFileNameDisplay.textContent = 'Ningún archivo seleccionado';
    
    modal.style.display = 'block';
};

// Handle edit patient
function handleEditPatient(e) {
    e.preventDefault();
    
    const id = document.getElementById('editPatientId').value;
    const oldPatient = allPatients[id];
    
    const updatedPatient = {
        nombre: document.getElementById('editPatientName').value.trim(),
        email: document.getElementById('editPatientEmail').value.trim(),
        telefono: document.getElementById('editPatientPhone').value.trim(),
        fechaTurno: document.getElementById('editAppointmentDate').value,
        horaTurno: document.getElementById('editAppointmentTime').value,
        monto: parseFloat(document.getElementById('editAmount').value),
        estadoPago: document.getElementById('editPaymentStatus').value,
        notas: document.getElementById('editNotes').value.trim(),
        fechaRegistro: oldPatient.fechaRegistro,
        clinicalFile: oldPatient.clinicalFile
    };
    
    // Upload new file if exists
    if (editSelectedFile) {
        const fileRef = storageRef(storage, `historias/${Date.now()}_${editSelectedFile.name}`);
        uploadBytes(fileRef, editSelectedFile)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            })
            .then((url) => {
                updatedPatient.clinicalFile = {
                    name: editSelectedFile.name,
                    url: url,
                    type: editSelectedFile.type,
                    uploadDate: new Date().toISOString()
                };
                updatePatientData(id, updatedPatient);
            })
            .catch((error) => {
                console.error('Error uploading file:', error);
                showNotification('Error al subir la historia clínica', 'error');
            });
    } else {
        updatePatientData(id, updatedPatient);
    }
}

function updatePatientData(id, updatedPatient) {
    const patientRef = ref(database, `sesiones/${id}`);
    update(patientRef, updatedPatient)
        .then(() => {
            showNotification('Sesión actualizada exitosamente', 'success');
            closeModal();
        })
        .catch((error) => {
            console.error('Error updating patient:', error);
            showNotification('Error al actualizar la sesión', 'error');
        });
}

// Delete patient
window.deletePatient = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
        const patientRef = ref(database, `sesiones/${id}`);
        remove(patientRef)
            .then(() => {
                showNotification('Sesión eliminada exitosamente', 'success');
            })
            .catch((error) => {
                console.error('Error deleting patient:', error);
                showNotification('Error al eliminar la sesión', 'error');
            });
    }
};

// View clinical file
window.viewClinicalFile = function(id) {
    const patient = allPatients[id];
    if (!patient || !patient.clinicalFile) {
        showNotification('No hay historia clínica para este paciente', 'error');
        return;
    }
    
    const file = patient.clinicalFile;
    const content = document.getElementById('viewModalContent');
    
    if (file.type.startsWith('image/')) {
        content.innerHTML = `<img src="${file.url}" alt="Historia Clínica">
                            <a href="${file.url}" download="${file.name}" class="btn btn-primary file-download-btn">Descargar</a>`;
    } else if (file.type === 'application/pdf') {
        content.innerHTML = `<iframe src="${file.url}"></iframe>
                            <a href="${file.url}" download="${file.name}" class="btn btn-primary file-download-btn">Descargar</a>`;
    } else {
        content.innerHTML = `<p>Archivo: ${escapeHtml(file.name)}</p>
                            <a href="${file.url}" download="${file.name}" class="btn btn-primary file-download-btn">Descargar</a>`;
    }
    
    viewModal.style.display = 'block';
};

// Close modal
function closeModal() {
    modal.style.display = 'none';
    editForm.reset();
    editSelectedFile = null;
    editFileNameDisplay.textContent = 'Ningún archivo seleccionado';
}

function closeViewModal() {
    viewModal.style.display = 'none';
}

// Calculate monthly statistics
function calculateMonthlyStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let total = 0;
    let paid = 0;
    let pending = 0;
    
    Object.values(allPatients).forEach(patient => {
        const sessionDate = new Date(patient.fechaRegistro);
        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
            total += patient.monto;
            if (patient.estadoPago === 'pagado') {
                paid += patient.monto;
            } else if (patient.estadoPago === 'pendiente') {
                pending += patient.monto;
            }
        }
    });
    
    updateMonthlyStats(total, paid, pending);
}

function updateMonthlyStats(total, paid, pending) {
    document.getElementById('monthlyTotal').textContent = formatMoney(total);
    document.getElementById('monthlyPaid').textContent = formatMoney(paid);
    document.getElementById('monthlyPending').textContent = formatMoney(pending);
}

function formatMoney(amount) {
    return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('ARS', '$').replace(/\s/g, '');
}

// Utility functions
function formatDateTime(date, time) {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Send email notification
async function sendEmailNotification(patient, sessionId) {
    try {
        const response = await fetch('https://consultorio-rt8n.onrender.com/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'conju33@hotmail.com',
                patientName: patient.nombre,
                appointmentDate: patient.fechaTurno,
                appointmentTime: patient.horaTurno,
                sessionId: sessionId
            })
        });
        
        if (response.ok) {
            console.log('Email enviado correctamente');
        }
    } catch (error) {
        console.log('Nota: El servidor de email no está disponible. Ignora este error si ejecutas en desarrollo.');
        console.error('Error sending email:', error);
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-weight: 500;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
