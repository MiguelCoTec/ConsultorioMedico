import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const db = getFirestore();

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
      try {
        const docRef = doc(db, 'Doctores', doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          Alert.alert('Error', 'Doctor no encontrado');
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
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
    const {
      firstName,
      lastName,
      email,
      phone,
      specialty,
      licenseNumber,
      consultationPrice,
    } = formData;

    if (!firstName || !lastName || !email || !phone || !specialty || !licenseNumber || !consultationPrice) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      const docRef = doc(db, 'Doctores', doctorId);
      await updateDoc(docRef, formData);
      Alert.alert('Éxito', 'Doctor actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al actualizar los datos');
      console.error('Error updating doctor:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const docRef = doc(db, 'Doctores', doctorId);
      await deleteDoc(docRef); // Eliminar completamente el documento
      Alert.alert('Éxito', 'Doctor eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al eliminar el doctor');
      console.error('Error deleting doctor:', error);
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
