// EditPatientController.js
import PatientModel from '../models/PatientModel';

class EditPatientController {
  constructor() {
    this.model = PatientModel;
  }

  async fetchPatient(patientId) {
    const result = await this.model.fetchPatient(patientId);
    return result;
  }

  async updatePatient(patientId, patientData) {
    const result = await this.model.updatePatient(patientId, patientData);
    return result;
  }

  async deletePatient(patientId) {
    const result = await this.model.deletePatient(patientId);
    return result;
  }

  async registerPatient(patientData) {
    const result = await this.model.registerPatient(patientData);
    return result;
  }
}

export default new EditPatientController();