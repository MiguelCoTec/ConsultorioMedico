// LoginController.js
import AuthModel from '../models/AuthModel';

class LoginController {
  constructor() {
    this.model = AuthModel;
  }

  async login(email, password) {
    const result = await this.model.login(email, password);
    return result;
  }

  async register(userData) {
    const result = await this.model.register(userData);
    return result;
  }
}

export default new LoginController();