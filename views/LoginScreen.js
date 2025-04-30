// LoginScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import LoginController from '../controllers/LoginController';

const LoginScreen = ({ navigation }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    const { email, password } = formData;
    try{
      const result = await LoginController.login(email, password);
      if (result.success) {
        Alert.alert('Éxito', result.message);
        //navigation.navigate('Home');

        if(result.rol === 'doctor'){
          navigation.replace('DoctorDashboard');
        } else if(result.rol === 'paciente'){
          navigation.replace('PatientDashboard');
        } else if(result.rol === 'admin'){
          navigation.replace('home');
        } else{
          navigation.replace('home');
        }

      } else {
        Alert.alert('Error', result.message);
      }
    }
    catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async () => {
    const result = await LoginController.register(formData);
    if (result.success) {
      Alert.alert('Éxito', result.message);
      setIsRegistering(false);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>
          {isRegistering ? 'Registro de Paciente' : 'Iniciar Sesión'}
        </Text>

        {isRegistering && (
          <>
            <TextInput
              placeholder="Nombre"
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
            <TextInput
              placeholder="Apellido"
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
            <TextInput
              placeholder="Teléfono"
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Fecha de Nacimiento (DD/MM/YYYY)"
              style={styles.input}
              value={formData.birthDate}
              onChangeText={(value) => handleInputChange('birthDate', value)}
            />
            <Picker
              selectedValue={formData.gender}
              style={styles.input}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <Picker.Item label="Selecciona Género" value="" />
              <Picker.Item label="Masculino" value="Masculino" />
              <Picker.Item label="Femenino" value="Femenino" />
            </Picker>
            <TextInput
              placeholder="Estatura (cm)"
              style={styles.input}
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Peso (kg)"
              style={styles.input}
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={formData.bloodType}
              style={styles.input}
              onValueChange={(value) => handleInputChange('bloodType', value)}
            >
              <Picker.Item label="Selecciona Tipo de Sangre" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
            </Picker>
          </>
        )}

        <TextInput
          placeholder="Correo"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Contraseña"
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
        />

        <Button
          title={isRegistering ? 'Registrar' : 'Ingresar'}
          onPress={isRegistering ? handleRegister : handleLogin}
        />

        <Button
          title={isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
          onPress={() => setIsRegistering(!isRegistering)}
          color="gray"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  loginContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default LoginScreen;