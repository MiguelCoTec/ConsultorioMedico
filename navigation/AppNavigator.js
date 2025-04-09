import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../views/LoginScreen';
import HomeScreen from '../views/HomeScreen';
import AddPatientScreen from '../views/AddPatientScreen';
import AddDoctor from '../views/AddDoctor';
import EditPatientScreen from '../views/EditPatientScreen';
import EditDoctorScreen from '../views/EditDoctorScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
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

