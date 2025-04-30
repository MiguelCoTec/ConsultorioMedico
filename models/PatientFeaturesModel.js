// PatientFeaturesModel.js
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

class PatientFeaturesModel {
  // Método para obtener el historial médico de un paciente
  async getMedicalHistory(patientId) {
    try {
      const historyRef = collection(db, 'HistorialMedico');
      const q = query(historyRef, where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);
      
      const historyRecords = [];
      querySnapshot.forEach((doc) => {
        historyRecords.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        data: historyRecords
      };
    } catch (error) {
      console.error('Error getting medical history:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  async getPatientProfile(patientId) {
    try {
      const patientDoc = await getDoc(doc(db, "Pacientes", patientId));
      
      if (patientDoc.exists()) {
        return {
          success: true,
          data: { id: patientDoc.id, ...patientDoc.data() }
        };
      } else {
        return {
          success: false,
          message: "No se encontró información del paciente"
        };
      }
    } catch (error) {
      console.error("Error al obtener perfil de paciente:", error);
      return {
        success: false,
        message: "Error al cargar el perfil: " + error.message
      };
    }
  }

  async updatePatientProfile(patientId, profileData) {
    try {
      const patientRef = doc(db, "Pacientes", patientId);
      
      // Verificar que el paciente existe antes de actualizar
      const patientDoc = await getDoc(patientRef);
      if (!patientDoc.exists()) {
        return {
          success: false,
          message: "El paciente no existe en la base de datos"
        };
      }
      
      // Actualizar solo los campos proporcionados
      await updateDoc(patientRef, {
        firstName: profileData.firstName || patientDoc.data().firstName,
        lastName: profileData.lastName || patientDoc.data().lastName,
        phone: profileData.phone || patientDoc.data().phone,
        birthDate: profileData.birthDate || patientDoc.data().birthDate,
        updatedAt: new Date()
      });
      
      return {
        success: true,
        message: "Perfil actualizado correctamente"
      };
    } catch (error) {
      console.error("Error al actualizar perfil de paciente:", error);
      return {
        success: false,
        message: "Error al actualizar el perfil: " + error.message
      };
    }
  }

  async getPatientAppointments(patientId) {
    try {
      const appointmentsRef = collection(db, 'Citas');
      const q = query(appointmentsRef, where('patientId', '==', patientId));
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
      console.error('Error getting patient appointments:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async searchDoctors(searchTerm) {
    try {
      const searchTermLower = searchTerm.toLowerCase();
      const doctorsRef = collection(db, 'Doctores');
      const querySnapshot = await getDocs(doctorsRef);
        
      const doctors = [];
      querySnapshot.forEach((doc) => {
        const doctorData = doc.data();
        // Buscar coincidencias en nombre, apellido o especialidad
        if (
          (doctorData.firstName && doctorData.firstName.toLowerCase().includes(searchTermLower)) ||
          (doctorData.lastName && doctorData.lastName.toLowerCase().includes(searchTermLower)) ||
          (doctorData.specialty && doctorData.specialty.toLowerCase().includes(searchTermLower))
        ) {
          doctors.push({ id: doc.id, ...doctorData });
        }
      });
        
      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      console.error('Error searching doctors:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async bookAppointment(appointmentData) {
    try {
      // Validar datos básicos necesarios
      if (!appointmentData.doctorId || !appointmentData.patientId || !appointmentData.date) {
        return {
          success: false,
          message: "Faltan datos requeridos para la cita"
        };
      }
      
      // Verificar que el doctor existe
      const doctorDoc = await getDoc(doc(db, "Doctores", appointmentData.doctorId));
      if (!doctorDoc.exists()) {
        return {
          success: false,
          message: "El doctor seleccionado no existe"
        };
      }
      
      // Verificar que el paciente existe
      const patientDoc = await getDoc(doc(db, "Pacientes", appointmentData.patientId));
      if (!patientDoc.exists()) {
        return {
          success: false,
          message: "El paciente no existe"
        };
      }
      
      // Preparar datos para guardar
      const doctor = doctorDoc.data();
      const patient = patientDoc.data();
      
      const appointmentToSave = {
        doctorId: appointmentData.doctorId,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientId: appointmentData.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        date: appointmentData.date,
        specialty: doctor.specialty || "No especificada",
        status: "pendiente", // pendiente, confirmada, cancelada
        createdAt: new Date(),
        notes: appointmentData.notes || "",
        location: appointmentData.location || "Consulta principal"
      };
      
      // Guardar la cita en Firestore
      const appointmentRef = await addDoc(collection(db, "Citas"), appointmentToSave);
      
      return {
        success: true,
        data: { id: appointmentRef.id, ...appointmentToSave },
        message: "Cita programada con éxito"
      };
    } catch (error) {
      console.error("Error al programar cita:", error);
      return {
        success: false,
        message: "Error al programar la cita: " + error.message
      };
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const appointmentRef = doc(db, "Citas", appointmentId);
      
      // Verificar que la cita existe
      const appointmentDoc = await getDoc(appointmentRef);
      if (!appointmentDoc.exists()) {
        return {
          success: false,
          message: "La cita no existe"
        };
      }
      
      // Actualizar el estado de la cita a cancelada
      await updateDoc(appointmentRef, {
        status: "cancelada",
        updatedAt: new Date()
      });
      
      return {
        success: true,
        message: "Cita cancelada correctamente"
      };
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      return {
        success: false,
        message: "Error al cancelar la cita: " + error.message
      };
    }
  }
}

export default new PatientFeaturesModel();