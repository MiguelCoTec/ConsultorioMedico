// DoctorController.js
import DoctorModel from '../models/DoctorModel';

class DoctorController {
  constructor() {
    this.model = DoctorModel;
  }

  async fetchDoctor(doctorId) {
    const result = await this.model.fetchDoctor(doctorId);
    return result;
  }

  async updateDoctor(doctorId, doctorData) {
    const result = await this.model.updateDoctor(doctorId, doctorData);
    return result;
  }

  async deleteDoctor(doctorId) {
    const result = await this.model.deleteDoctor(doctorId);
    return result;
  }

  async registerDoctor(doctorData) {
    const result = await this.model.registerDoctor(doctorData);
    return result;
  }
}

export default new DoctorController();