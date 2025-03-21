// DoctorModel.js
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();

class DoctorModel {
  async fetchDoctor(doctorId) {
    try {
      const docRef = doc(db, 'Doctores', doctorId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: 'Doctor no encontrado' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateDoctor(doctorId, doctorData) {
    try {
      const docRef = doc(db, 'Doctores', doctorId);
      await updateDoc(docRef, doctorData);
      return { success: true, message: 'Doctor actualizado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteDoctor(doctorId) {
    try {
      const docRef = doc(db, 'Doctores', doctorId);
      await deleteDoc(docRef);
      return { success: true, message: 'Doctor eliminado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async registerDoctor(doctorData) {
    const { email, password, firstName, lastName, phone, specialty, licenseNumber, consultationPrice } = doctorData;

    if (!email || !password || !firstName || !lastName || !phone || !specialty || !licenseNumber || !consultationPrice) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const rol = 'Doctor';

      await setDoc(doc(db, 'Doctores', userId), {
        userId,
        rol,
        firstName,
        lastName,
        email,
        phone,
        specialty,
        licenseNumber,
        consultationPrice,
        createdAt: new Date(),
      });

      return { success: true, message: 'Doctor registrado correctamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new DoctorModel();