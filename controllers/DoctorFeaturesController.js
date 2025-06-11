// DoctorFeaturesController.js
import DoctorFeaturesModel from '../models/DoctorFeaturesModel';

class DoctorFeaturesController {
  constructor() {
    this.model = DoctorFeaturesModel;
  }

  async searchPatients(searchTerm) {
    return await this.model.searchPatients(searchTerm);
  }

  async getDoctorAppointments(doctorId) {
    return await this.model.getDoctorAppointments(doctorId);
  }

  // Nuevo método para obtener el perfil del doctor
  async getDoctorProfile(doctorId) {
    return await this.model.getDoctorProfile(doctorId);
  }

  // Nuevo método para actualizar el perfil del doctor
  async updateDoctorProfile(doctorId, profileData) {
    return await this.model.updateDoctorProfile(doctorId, profileData);
  }

  async updateAppointment(appointmentId, updatedData) {
    return await this.model.updateAppointment(appointmentId, updatedData);
  }

  //Para Agregar Citas
  async searchPatients(searchTerm) {
    return await this.model.searchPatients(searchTerm);
  }
  
  async createAppointment(appointmentData) {
    return await this.model.createAppointment(appointmentData);
  }

  async createPrescription(recetaData){
    return await this.model.createPrescription(recetaData);
  }

  async getDoctorPrescriptions(doctorId){
    return await this.model.getDoctorPrescriptions(doctorId);
  }

  async getPatientPrescriptions(pacienteId){
    return await this.model.getPatientPrescriptions(pacienteId);
  }

  async updatePrescription(prescriptionId, updatedData){
    return await this.model.updatePrescription(prescriptionId, updatedData);
  }

  async deletePrescription(prescriptionId){
    return await this.model.deletePrescription(prescriptionId);
  }

  async getPatientNotifications(patientId){
    return await this.model.getPatientNotifications(patientId);
  }

  async markNotificationAsRead(notificationId){
    return await this.model.markNotificationAsRead(notificationId);
  }
}

export default new DoctorFeaturesController();