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
}

export default new DoctorFeaturesController();