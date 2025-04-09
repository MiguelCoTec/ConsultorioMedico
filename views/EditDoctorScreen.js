// EditDoctorScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import DoctorController from '../controllers/DoctorController';

const EditDoctorScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const doctorId = route.params?.doctorId;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    consultationPrice: '',
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      const result = await DoctorController.fetchDoctor(doctorId);
      if (result.success) {
        setFormData(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    const result = await DoctorController.updateDoctor(doctorId, formData);
    if (result.success) {
      Alert.alert('Éxito', result.message);
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDelete = async () => {
    const result = await DoctorController.deleteDoctor(doctorId);
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
        <Text style={styles.title}>Editar Doctor</Text>

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
          placeholder="Correo"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
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
          placeholder="Cédula"
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

        <Button title="Actualizar Doctor" onPress={handleUpdate} />
        <Button title="Eliminar Doctor" color="red" onPress={handleDelete} />
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

export default EditDoctorScreen;