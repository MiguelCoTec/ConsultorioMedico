// AuthModel.js
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

class AuthModel {
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      //var rol = '';
      const rol = await this.getUserRole(user.uid);
      console.log(rol);
      
      /*
      const pacienteDoc = await getDoc(doc(db, "Pacientes", user.uid));
      const doctorDoc = await getDoc(doc(db, "Doctores", user.uid));
      if(pacienteDoc.exists()){
        rol = 'paciente';
      }
      else if(doctorDoc.exists()){
        rol = 'doctor';
      }
      else{
        rol = 'admin';
      }*/
      
      //console.log(rol);
      return { success: true, message: 'Inicio de sesión exitoso', rol: rol };
    } catch (error) {
      return { success: false, message: error.message, rol: 'Error' };
    }
  }

  async register(userData) {
    const { email, password, firstName, lastName, phone, birthDate, gender, height, weight, bloodType } = userData;

    if (!email || !password || !firstName || !lastName || !phone || !birthDate || !gender || !height || !weight || !bloodType) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const rol = 'paciente';

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

      return { success: true, message: 'Registro exitoso' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getDocumentReference(collection, docId) {
    try {
      const docRef = doc(db, collection, docId);
      const docSnap = await getDoc(docRef);
      return docSnap;
    } catch (error) {
      console.error(`Error al obtener documento de ${collection}:`, error);
      throw error;
    }
  }

  // Método para verificar el rol del usuario actual
  async getUserRole(userId) {
    try {
      const pacienteDoc = await this.getDocumentReference("Pacientes", userId);
      const doctorDoc = await this.getDocumentReference("Doctores", userId);
      
      if (pacienteDoc.exists()) {
        return 'paciente';
      } else if (doctorDoc.exists()) {
        return 'doctor';
      } else {
        return 'admin';
      }
    } catch (error) {
      console.error("Error al verificar el rol:", error);
      return null;
    }
  }

  // Método para verificar el rol del usuario actualmente autenticado
  async getCurrentUserRole() {
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      return await this.getUserRole(currentUser.uid);
    } else {
      return null;
    }
  }
}

export default new AuthModel();