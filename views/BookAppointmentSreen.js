// BookAppointmentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PatientFeaturesController from '../controllers/PatientFeaturesController';

const BookAppointmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, patientId } = route.params || {};
  
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('Consulta principal');
  
  useEffect(() => {
    if (doctorId) {
      fetchDoctorInfo();
    }
  }, [doctorId]);
  
  const fetchDoctorInfo = async () => {
    try {
      // Aquí deberíamos tener un método específico para obtener información de un doctor,
      // pero por simplicidad, vamos a simular que buscamos al doctor por su ID
      const result = await PatientFeaturesController.searchDoctors('');
      if (result.success) {
        const doctor = result.data.find(doc => doc.id === doctorId);
        if (doctor) {
          setDoctorInfo(doctor);
        } else {
          Alert.alert('Error', 'No se encontró información del doctor');
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', result.message || 'No se pudo obtener información del doctor');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
      Alert.alert('Error', 'Ocurrió un error al obtener información del doctor');
      navigation.goBack();
    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  const handleBookAppointment = async () => {
    // Combinar fecha y hora en un solo objeto Date
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(time.getHours(), time.getMinutes());
    
    // Validar que la fecha/hora sea futura
    if (combinedDateTime <= new Date()) {
      Alert.alert('Error', 'Por favor seleccione una fecha y hora futura para la cita');
      return;
    }
    
    try {
      const appointmentData = {
        doctorId,
        patientId,
        date: combinedDateTime,
        notes,
        location
      };
      
      const result = await PatientFeaturesController.bookAppointment(appointmentData);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Cita programada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('PatientDashboard')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo programar la cita');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Ocurrió un error al programar la cita');
    }
  };
  
  // Formatear fecha para mostrarla
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Formatear hora para mostrarla
  const formatTime = (time) => {
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <LinearGradient colors={['#4a90e2', '#f4e9e9']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Programar Cita</Text>
          
          {doctorInfo && (
            <View style={styles.doctorCard}>
              <Text style={styles.doctorName}>Dr. {doctorInfo.firstName} {doctorInfo.lastName}</Text>
              <Text style={styles.doctorInfo}>Especialidad: {doctorInfo.specialty || 'No especificada'}</Text>
              {doctorInfo.phone && <Text style={styles.doctorInfo}>Teléfono: {doctorInfo.phone}</Text>}
            </View>
          )}
          
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha de la cita:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora de la cita:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{formatTime(time)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicación:</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Ingrese la ubicación"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas/Síntomas:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Describa brevemente el motivo de su consulta"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBookAppointment}
            >
              <Text style={styles.bookButtonText}>Programar Cita</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  doctorCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  doctorInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BookAppointmentScreen;