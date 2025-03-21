// PatientModel.js
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();

class PatientModel {
  async fetchPatient(patientId) {
    try {
      const docRef = doc(db, 'Pacientes', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: 'Paciente no encontrado' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      const docRef = doc(db, 'Pacientes', patientId);
      await updateDoc(docRef, patientData);
      return { success: true, message: 'Paciente actualizado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deletePatient(patientId) {
    try {
      const docRef = doc(db, 'Pacientes', patientId);
      await deleteDoc(docRef);
      return { success: true, message: 'Paciente eliminado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async registerPatient(patientData) {
    const { email, password, firstName, lastName, phone, birthDate, gender, height, weight, bloodType } = patientData;

    if (!email || !password || !firstName || !lastName || !phone || !birthDate || !gender || !height || !weight || !bloodType) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const rol = 'Paciente';

      // Guardar los datos en Firestore
      await setDoc(doc(db, 'Pacientes', userId), {
        userId,
        rol,
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        gender,
        height,
        weight,
        bloodType,
        createdAt: new Date(),
      });

      return { success: true, message: 'Paciente registrado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new PatientModel();