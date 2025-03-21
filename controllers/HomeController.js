// HomeController.js
import FirebaseModel from '../models/FirebaseModel';

class HomeController {
    constructor() {
      this.model = FirebaseModel;
      this.patients = [];
      this.doctors = [];
      this.isLoading = true;
      this.activeView = 'patients';
    }
  
    async fetchData(view) {
      this.activeView = view; 
      try {
        if (this.activeView === 'patients') {
          this.patients = await this.model.fetchPatients();
        } else if (this.activeView === 'doctors') {
          this.doctors = await this.model.fetchDoctors();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.isLoading = false;
      }
    }
  
    getPatients() {
      return this.patients;
    }
  
    getDoctors() {
      return this.doctors;
    }
  
    getIsLoading() {
      return this.isLoading;
    }
  
    getActiveView() {
      return this.activeView;
    }
  }
  
  export default new HomeController();