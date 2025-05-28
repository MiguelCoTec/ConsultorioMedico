// DoctorFeaturesModel.js
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp, serverTimestamp, orderBy } from 'firebase/firestore';

const db = getFirestore();

class DoctorFeaturesModel {
  async searchPatients(searchTerm) {
    try {
      const searchTermLower = searchTerm.toLowerCase();
      const patientsRef = collection(db, 'Pacientes');
      const querySnapshot = await getDocs(patientsRef);
        
      const patients = [];
      querySnapshot.forEach((doc) => {
        const patientData = doc.data();
        // Buscar coincidencias en nombre, apellido o correo
        if (
          patientData.firstName.toLowerCase().includes(searchTermLower) ||
          patientData.lastName.toLowerCase().includes(searchTermLower) ||
          patientData.email.toLowerCase().includes(searchTermLower)
        ) {
          patients.push({ id: doc.id, ...patientData });
        }
      });
        
      return {
        success: true,
        data: patients
      };
    } catch (error) {
      console.error('Error searching patients:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getDoctorAppointments(doctorId) {
    try {
      const appointmentsRef = collection(db, 'Citas');
      const q = query(appointmentsRef, where('iddoctor', '==', doctorId));
      const querySnapshot = await getDocs(q);
      
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        data: appointments
      };
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  //Actualizar Citas
  async updateAppointment(appointmentId, updatedData) {
    try {
      const appointmentRef = doc(db, 'Citas', appointmentId);
      await updateDoc(appointmentRef, updatedData);
      
      return {
        success: true,
        message: 'Cita actualizada correctamente'
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Nuevo método para obtener el perfil del doctor
  async getDoctorProfile(doctorId) {
    try {
      const doctorDoc = await getDoc(doc(db, "Doctores", doctorId));
      
      if (doctorDoc.exists()) {
        return {
          success: true,
          data: { id: doctorDoc.id, ...doctorDoc.data() }
        };
      } else {
        return {
          success: false,
          message: "No se encontró información del doctor"
        };
      }
    } catch (error) {
      console.error("Error al obtener perfil de doctor:", error);
      return {
        success: false,
        message: "Error al cargar el perfil: " + error.message
      };
    }
  }

  // Nuevo método para actualizar el perfil del doctor
  async updateDoctorProfile(doctorId, profileData) {
    try {
      const doctorRef = doc(db, "Doctores", doctorId);
      
      // Verificar que el doctor existe antes de actualizar
      const doctorDoc = await getDoc(doctorRef);
      if (!doctorDoc.exists()) {
        return {
          success: false,
          message: "El doctor no existe en la base de datos"
        };
      }
      
      // Actualizar solo los campos proporcionados
      await updateDoc(doctorRef, {
        firstName: profileData.firstName || doctorDoc.data().firstName,
        lastName: profileData.lastName || doctorDoc.data().lastName,
        phone: profileData.phone || doctorDoc.data().phone,
        specialty: profileData.specialty || doctorDoc.data().specialty,
        license: profileData.license || doctorDoc.data().license,
        updatedAt: new Date()
      });
      
      return {
        success: true,
        message: "Perfil actualizado correctamente"
      };
    } catch (error) {
      console.error("Error al actualizar perfil de doctor:", error);
      return {
        success: false,
        message: "Error al actualizar el perfil: " + error.message
      };
    }
  }

  // Para agregar citas

  async searchPatients(searchTerm) {
    try {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Primero buscar por nombre
      const patientsRef = collection(db, 'Pacientes');
      const querySnapshot = await getDocs(patientsRef);
      
      const patients = [];
      querySnapshot.forEach((doc) => {
        const patientData = doc.data();
        // Verificar si el nombre o correo contiene el término de búsqueda
        if (
          (patientData.firstName && patientData.firstName.toLowerCase().includes(searchTermLower)) ||
          (patientData.email && patientData.email.toLowerCase().includes(searchTermLower))
        ) {
          patients.push({
            id: doc.id,
            ...patientData
          });
        }
      });
      
      return {
        success: true,
        data: patients
      };
    } catch (error) {
      console.error('Error searching patients:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async createAppointment(appointmentData) {
    try {
      // Convertir la fecha a Timestamp de Firestore si es un objeto Date
      const { fecha, ...otherData } = appointmentData;
      
      // Importar Timestamp de Firebase si aún no está importado
      const { Timestamp } = require('firebase/firestore');
      
      // Crear un objeto con la fecha convertida a Timestamp
      const firestoreData = {
        ...otherData,
        fecha: fecha instanceof Date ? Timestamp.fromDate(fecha) : fecha,
        fechaCreacion: Timestamp.now() // Añadir la fecha de creación
      };
      
      // Añadir la cita a Firestore
      const citasRef = collection(db, 'Citas');
      const docRef = await addDoc(citasRef, firestoreData);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...firestoreData
        },
        message: 'Cita creada con éxito'
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Crear una nueva receta médica
   * @param {Object} recetaData - Datos de la receta
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createPrescription(recetaData) {
    try {
      const {
        idDoctor,
        idPaciente,
        nombrePaciente,
        fecha,
        medicamentos
      } = recetaData;

      // Validaciones básicas
      if (!idDoctor || !idPaciente || !nombrePaciente) {
        return {
          success: false,
          message: 'Faltan datos requeridos (doctor, paciente)'
        };
      }

      if (!medicamentos || medicamentos.length === 0) {
        return {
          success: false,
          message: 'Debe incluir al menos un medicamento'
        };
      }

      // Validar que todos los medicamentos tengan los campos requeridos
      const medicamentosValidos = medicamentos.every(med => 
        med.nombre && med.cantidad && med.instrucciones
      );

      if (!medicamentosValidos) {
        return {
          success: false,
          message: 'Todos los medicamentos deben tener nombre, cantidad e instrucciones'
        };
      }

      // Estructura de datos para la receta
      const recetaDocumento = {
        idDoctor,
        idPaciente,
        nombrePaciente,
        fecha: fecha || new Date(),
        fechaCreacion: serverTimestamp(),
        medicamentos: medicamentos.map(med => ({
          nombre: med.nombre.trim(),
          cantidad: med.cantidad.trim(),
          instrucciones: med.instrucciones.trim()
        })),
        activa: true, // Campo para manejar si la receta está activa
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Guardar en Firestore
      const recetasRef = collection(db, 'recetas');
      const docRef = await addDoc(recetasRef, recetaDocumento);

      return {
        success: true,
        message: 'Receta creada exitosamente',
        data: {
          idReceta: docRef.id,
          ...recetaDocumento
        }
      };

    } catch (error) {
      console.error('Error al crear receta:', error);
      return {
        success: false,
        message: 'Error al crear la receta: ' + error.message
      };
    }
  }

  /**
   * Obtener todas las recetas de un doctor
   * @param {string} doctorId - ID del doctor
   * @returns {Object} - Resultado con las recetas
   */
  async getDoctorPrescriptions(doctorId) {
    try {
      if (!doctorId) {
        return {
          success: false,
          message: 'ID del doctor es requerido'
        };
      }

      // Consulta para obtener recetas del doctor ordenadas por fecha de creación
      const prescriptionsRef = collection(db, 'recetas');
      const q = query(
        prescriptionsRef,
        where('idDoctor', '==', doctorId),
        where('activa', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const prescriptions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prescriptions.push({
          idReceta: doc.id,
          ...data
        });
      });

      return {
        success: true,
        message: 'Recetas obtenidas exitosamente',
        data: prescriptions
      };

    } catch (error) {
      console.error('Error obteniendo recetas:', error);
      return {
        success: false,
        message: 'Error al obtener las recetas: ' + error.message
      };
    }
  }

  /**
   * Actualizar una receta existente
   * @param {string} prescriptionId - ID de la receta a actualizar
   * @param {Object} updatedData - Datos actualizados
   * @returns {Object} - Resultado de la operación
   */
  async updatePrescription(prescriptionId, updatedData) {
    try {
      if (!prescriptionId) {
        return {
          success: false,
          message: 'ID de la receta es requerido'
        };
      }

      // Validar datos requeridos
      if (!updatedData.medicamentos || updatedData.medicamentos.length === 0) {
        return {
          success: false,
          message: 'Debe incluir al menos un medicamento'
        };
      }

      // Verificar que la receta existe
      const prescriptionRef = doc(db, 'recetas', prescriptionId);
      const prescriptionSnap = await getDoc(prescriptionRef);

      if (!prescriptionSnap.exists()) {
        return {
          success: false,
          message: 'Receta no encontrada'
        };
      }

      // Preparar datos para actualizar
      const updateData = {
        medicamentos: updatedData.medicamentos.map(med => ({
          nombre: med.nombre.trim(),
          cantidad: med.cantidad.trim(),
          instrucciones: med.instrucciones.trim()
        })),
        fechaModificacion: serverTimestamp()
      };

      // Si se proporciona una nueva fecha, actualizarla
      if (updatedData.fecha) {
        updateData.fecha = updatedData.fecha instanceof Date ? 
                           Timestamp.fromDate(updatedData.fecha) : 
                           Timestamp.fromDate(new Date(updatedData.fecha));
      }

      // Actualizar en Firestore
      await updateDoc(prescriptionRef, updateData);

      return {
        success: true,
        message: 'Receta actualizada exitosamente'
      };

    } catch (error) {
      console.error('Error actualizando receta:', error);
      return {
        success: false,
        message: 'Error al actualizar la receta: ' + error.message
      };
    }
  }

  /**
   * Eliminar una receta (soft delete)
   * @param {string} prescriptionId - ID de la receta a eliminar
   * @returns {Object} - Resultado de la operación
   */
  async deletePrescription(prescriptionId) {
    try {
      if (!prescriptionId) {
        return {
          success: false,
          message: 'ID de la receta es requerido'
        };
      }

      // Verificar que la receta existe
      const prescriptionRef = doc(db, 'recetas', prescriptionId);
      const prescriptionSnap = await getDoc(prescriptionRef);

      if (!prescriptionSnap.exists()) {
        return {
          success: false,
          message: 'Receta no encontrada'
        };
      }

      // Soft delete - marcar como inactiva en lugar de eliminar
      await updateDoc(prescriptionRef, {
        activa: false,
        fechaEliminacion: serverTimestamp()
      });

      return {
        success: true,
        message: 'Receta eliminada exitosamente'
      };

    } catch (error) {
      console.error('Error eliminando receta:', error);
      return {
        success: false,
        message: 'Error al eliminar la receta: ' + error.message
      };
    }
  }

  /**
   * Obtener recetas de un paciente específico
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Object>} Lista de recetas del paciente
   */
  async getPatientPrescriptions(pacienteId) {
    try {
      const recetasRef = collection(db, 'recetas');
      const q = query(
        recetasRef, 
        where('idPaciente', '==', pacienteId),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recetas = [];
      
      querySnapshot.forEach((doc) => {
        recetas.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        data: recetas
      };

    } catch (error) {
      console.error('Error al obtener recetas del paciente:', error);
      return {
        success: false,
        message: 'Error al obtener las recetas del paciente: ' + error.message
      };
    }
  }
}

export default new DoctorFeaturesModel();