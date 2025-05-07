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
}

export default new DoctorFeaturesController();