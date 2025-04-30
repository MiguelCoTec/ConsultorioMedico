// DoctorFeaturesModel.js
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

class DoctorFeaturesModel {
  /*
  async searchPatients(searchTerm) {
    try {
      const patientsCollection = collection(db, 'Pacientes');
      const q = query(
        patientsCollection,
        where('firstName', '>=', searchTerm),
        where('firstName', '<=', searchTerm + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: true, data: [], message: 'No se encontraron pacientes' };
      }

      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: patients };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getDoctorAppointments(doctorId) {
    try {
      const appointmentsCollection = collection(db, 'Citas');
      const q = query(appointmentsCollection, where('userId', '==', doctorId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { success: true, data: [], message: 'No hay citas programadas' };
      }

      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }*/

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
      const q = query(appointmentsRef, where('doctorId', '==', doctorId));
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
}

export default new DoctorFeaturesModel();