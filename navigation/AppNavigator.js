import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { auth } from '../firebase';
import AuthModel from '../models/AuthModel';

import LoginScreen from '../views/LoginScreen';
import HomeScreen from '../views/HomeScreen';
import AddPatientScreen from '../views/AddPatientScreen';
import AddDoctor from '../views/AddDoctor';
import EditPatientScreen from '../views/EditPatientScreen';
import EditDoctorScreen from '../views/EditDoctorScreen';
import DoctorDashboardScreen from '../views/DoctorDashboardScreen';
import PatientDashboardScreen from '../views/PatientDashboardScreen';
//import BookAppointmentScreen from '../views/BookAppointmentSreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try{
          const docRefPaciente = await AuthModel.getDocumentReference('Pacientes', user.uid);
          const docRefDoctor = await AuthModel.getDocumentReference('Doctores', user.uid);
          let role = 'admin';

          if (docRefPaciente.exists()) {
            role = 'paciente';
          } else if (docRefDoctor.exists()) {
            role = 'doctor';
          }

          setUserRole(role);
          if(role === 'doctor'){
            setInitialRoute('DoctorDashboard');
          }
          else if(role === 'paciente'){
            setInitialRoute('PatientDashboard');
          }
          else{
            setInitialRoute('Home');
          }
          //setInitialRoute(role === 'doctor' ? 'DoctorDashboard' : 'Home');

        }catch(error){
          console.error("Error al obtener el rol del usuario:", error);
          setInitialRoute('Login');
        }
      } else {
        setUserRole(null);
        setInitialRoute('Login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PatientDashboard"
          component={PatientDashboardScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        

        <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Agregar Paciente' }} />
        <Stack.Screen name="AddDoctor" component={AddDoctor} options={{ title: 'Agregar Doctor' }} />
        <Stack.Screen name="EditPatient" component={EditPatientScreen} options={{ title: 'Editar Paciente' }} />
        <Stack.Screen name="EditDoctor" component={EditDoctorScreen} options={{ title: 'Editar Paciente' }} />

        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

