// LoginController.js
import AuthModel from '../models/AuthModel';

class LoginController {
  constructor() {
    this.model = AuthModel;
  }
  
  async login(email, password) {
    try{
      const result = await this.model.login(email, password);

      // Asegurarnos de que el rol esté incluido en el resultado
      if (result.success && result.rol) {
        // Devolver el resultado con toda la información necesaria
        return {
          success: true,
          message: result.message,
          rol: result.rol,
          // Si hay más datos que necesites pasar, agrégalos aquí
        };
      } else {
        return result; // Devuelve el resultado error tal como está
      }
    }catch (error) {
      return {
        success: false,
        message: `Error en el controlador: ${error.message}`,
        rol: null
      };
    }
    
  }

  async register(userData) {
    const result = await this.model.register(userData);
    return result;
  }
}

export default new LoginController();