// DoctorFeaturesModel.js
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

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
}

export default new DoctorFeaturesModel();