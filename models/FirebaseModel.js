// FirebaseModel.js
import { getFirestore, collection, getDocs } from 'firebase/firestore';

class FirebaseModel {
  constructor() {
    this.db = getFirestore();
  }

  async fetchPatients() {
    const patientsCollection = collection(this.db, 'Pacientes');
    const snapshot = await getDocs(patientsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async fetchDoctors() {
    const doctorsCollection = collection(this.db, 'Doctores');
    const snapshot = await getDocs(doctorsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export default new FirebaseModel();