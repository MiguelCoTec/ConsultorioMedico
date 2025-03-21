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
      var rol = '';

      //Verificar rol
      
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
      }
      
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
      const rol = 'Paciente';

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
}

export default new AuthModel();