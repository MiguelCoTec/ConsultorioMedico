// AddDoctor.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import DoctorController from '../controllers/DoctorController';

const AddDoctor = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    consultationPrice: '',
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    const result = await DoctorController.registerDoctor(formData);
    if (result.success) {
      Alert.alert('Éxito', result.message);
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Doctor</Text>

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
          placeholder="Especialidad"
          style={styles.input}
          value={formData.specialty}
          onChangeText={(value) => handleInputChange('specialty', value)}
        />
        <TextInput
          placeholder="Número de Cédula"
          style={styles.input}
          value={formData.licenseNumber}
          onChangeText={(value) => handleInputChange('licenseNumber', value)}
        />
        <TextInput
          placeholder="Precio de Consulta"
          style={styles.input}
          value={formData.consultationPrice}
          onChangeText={(value) => handleInputChange('consultationPrice', value)}
          keyboardType="numeric"
        />

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

        <Button title="Registrar Doctor" onPress={handleRegister} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
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

export default AddDoctor;