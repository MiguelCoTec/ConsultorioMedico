import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('patients');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();

      try {
        if (activeView === 'patients') {
          const patientsCollection = collection(db, 'Pacientes');
          const snapshot = await getDocs(patientsCollection);
          const patientsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPatients(patientsList);
        } else if (activeView === 'doctors') {
          const doctorsCollection = collection(db, 'Doctores');
          const snapshot = await getDocs(doctorsCollection);
          const doctorsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeView]);

  const handlePatientPress = (patientId) => {
    navigation.navigate('EditPatient', { patientId });
  };

  const handleDoctorPress = (doctorId) => {
    navigation.navigate('EditDoctor', { doctorId });
  };

  const renderPatient = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePatientPress(item.id)}>
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
      <Text style={styles.details}>Fecha de Nacimiento: {item.birthDate}</Text>
      <Text style={styles.details}>Género: {item.gender}</Text>
      <Text style={styles.details}>Estatura: {item.height} cm</Text>
      <Text style={styles.details}>Peso: {item.weight} Kg</Text>
      <Text style={styles.details}>Tipo de Sangre: {item.bloodType}</Text>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleDoctorPress(item.id)}>
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
      <Text style={styles.details}>Especialidad: {item.specialty}</Text>
      <Text style={styles.details}>Cedula: {item.licenseNumber}</Text>
      <Text style={styles.details}>Correo: {item.email}</Text>
      <Text style={styles.details}>Celular: {item.phone}</Text>
      <Text style={styles.details}>Precio de Consulta: ${item.consultationPrice}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#41dfbf" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <Text style={styles.title}>Consultorio</Text>

      <View style={styles.buttonContainer}>
        <Button title="Ver Pacientes" onPress={() => setActiveView('patients')} />
        <Button title="Ver Doctores" onPress={() => setActiveView('doctors')} />
      </View>

      {activeView === 'patients' && (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={renderPatient}
        />
      )}

      {activeView === 'doctors' && (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
        />
      )}

      <View style={styles.addButtonContainer}>
        <Button
          title={activeView === 'patients' ? 'Agregar nuevo paciente' : 'Agregar nuevo doctor'}
          onPress={() => navigation.navigate(activeView === 'patients' ? 'AddPatient' : 'AddDoctor')}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 16,
    color: '#666',
  },
  addButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
