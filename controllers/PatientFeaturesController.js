// PatientFeaturesController.js
import PatientFeaturesModel from '../models/PatientFeaturesModel.js';

class PatientFeaturesController {
  constructor() {
    this.model = PatientFeaturesModel;
  }

  async getPatientProfile(patientId) {
    return await this.model.getPatientProfile(patientId);
  }

  async updatePatientProfile(patientId, profileData) {
    return await this.model.updatePatientProfile(patientId, profileData);
  }

  async getPatientAppointments(patientId) {
    return await this.model.getPatientAppointments(patientId);
  }

  async searchDoctors(searchTerm) {
    return await this.model.searchDoctors(searchTerm);
  }

  async bookAppointment(appointmentData) {
    return await this.model.bookAppointment(appointmentData);
  }

  async cancelAppointment(appointmentId) {
    return await this.model.cancelAppointment(appointmentId);
  }
  
  async getMedicalHistory(patientId) {
    return await this.model.getMedicalHistory(patientId);
  }
  
  async getPatientPrescriptions(patientId) {
    return await this.model.getPatientPrescriptions(patientId);
  }

  async getPatientPrescriptions(patientId){
    return await this.model.getPatientPrescriptions(patientId);
  }
}

export default new PatientFeaturesController();