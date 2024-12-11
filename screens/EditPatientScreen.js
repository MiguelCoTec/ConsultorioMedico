import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

const EditPatientScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const docRef = doc(db, 'Pacientes', patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          Alert.alert('Error', 'Paciente no encontrado');
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      gender,
      height,
      weight,
      bloodType,
    } = formData;

    if (!firstName || !lastName || !email || !phone || !birthDate || !gender || !height || !weight || !bloodType) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      const docRef = doc(db, 'Pacientes', patientId);
      await updateDoc(docRef, formData);
      Alert.alert('Éxito', 'Paciente actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const docRef = doc(db, 'Pacientes', patientId);
      await deleteDoc(docRef);
      Alert.alert('Éxito', 'Paciente eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Editar Paciente</Text>

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
        <TextInput
          placeholder="Género"
          style={styles.input}
          value={formData.gender}
          onChangeText={(value) => handleInputChange('gender', value)}
        />
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
        <TextInput
          placeholder="Tipo de Sangre"
          style={styles.input}
          value={formData.bloodType}
          onChangeText={(value) => handleInputChange('bloodType', value)}
        />

        <TextInput
          placeholder="Correo"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
        />

        <Button title="Actualizar Paciente" onPress={handleUpdate} />
        <Button title="Eliminar Paciente" onPress={handleDelete} color="red" />
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

export default EditPatientScreen;