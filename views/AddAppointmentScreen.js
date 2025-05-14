import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const AddAppointmentScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombrePaciente: '',
    telefonoPaciente: '',
    correoPaciente: '',
    idpaciente: '',
    iddoctor: auth.currentUser?.uid || '',
    fecha: new Date(),
    motivo: '',
    diagnostico: '',
    estatus: 'Pendiente',
  });

  // Estados para los pickers de fecha y hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // Si hay un doctor autenticado, establecer su ID en el formulario
    if (auth.currentUser) {
      setFormData(prev => ({ ...prev, iddoctor: auth.currentUser.uid }));
    }
  }, [auth.currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      return;
    }
    if (selectedDate) {
      // Mantener la hora actual cuando sólo se cambia la fecha
      const currentTime = formData.fecha;
      selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes());
      setFormData(prev => ({ ...prev, fecha: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      return;
    }
    if (selectedTime) {
      // Mantener la fecha actual cuando sólo se cambia la hora
      const newDate = new Date(formData.fecha);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setFormData(prev => ({ ...prev, fecha: newDate }));
    }
  };

  const searchPatients = async () => {
    if (!patientSearch.trim()) {
      Alert.alert('Error', 'Por favor ingrese un término de búsqueda');
      return;
    }

    try {
      setSearchLoading(true);
      const result = await DoctorFeaturesController.searchPatients(patientSearch);
      if (result.success) {
        setPatients(result.data);
        setIsSearchModalVisible(true);
      } else {
        Alert.alert('Error', result.message || 'No se encontraron pacientes');
      }
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      Alert.alert('Error', 'Ocurrió un problema al buscar pacientes');
    } finally {
      setSearchLoading(false);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      nombrePaciente: patient.firstName || '',
      telefonoPaciente: patient.phone || '',
      correoPaciente: patient.email || '',
      idpaciente: patient.userId || '',
    }));
    setIsSearchModalVisible(false);
  };

  const validateForm = () => {
    // Validación básica
    if (!formData.nombrePaciente.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre del paciente');
      return false;
    }
    if (!formData.motivo.trim()) {
      Alert.alert('Error', 'Por favor ingrese el motivo de la cita');
      return false;
    }
    
    // Validar que la fecha sea futura
    const now = new Date();
    if (formData.fecha <= now) {
      Alert.alert('Error', 'La fecha de la cita debe ser futura');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await DoctorFeaturesController.createAppointment(formData);
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          'La cita ha sido programada correctamente',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo crear la cita');
      }
    } catch (error) {
      console.error('Error creando cita:', error);
      Alert.alert('Error', 'Ocurrió un problema al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
        <View style={styles.container}>
        

        <ScrollView style={styles.content}>
            <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información del Paciente</Text>
            
            {/* Búsqueda de paciente */}
            <View style={styles.searchContainer}>
                <TextInput
                style={styles.searchInput}
                placeholder="Buscar paciente por nombre o correo"
                value={patientSearch}
                onChangeText={setPatientSearch}
                />
                <TouchableOpacity 
                style={styles.searchButton} 
                onPress={searchPatients}
                disabled={searchLoading}
                >
                {searchLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Ionicons name="search" size={20} color="white" />
                )}
                </TouchableOpacity>
            </View>

            {selectedPatient && (
                <View style={styles.selectedPatientContainer}>
                <Text style={styles.selectedPatientText}>
                    Paciente seleccionado: {selectedPatient.firstName}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                    setSelectedPatient(null);
                    setFormData(prev => ({
                        ...prev,
                        nombrePaciente: '',
                        telefonoPaciente: '',
                        correoPaciente: '',
                        idpaciente: '',
                    }));
                    }}
                >
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
                </View>
            )}

            <Text style={styles.inputLabel}>Nombre del Paciente *</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={formData.nombrePaciente}
                onChangeText={(text) => handleInputChange('nombrePaciente', text)}
                editable={!selectedPatient}
            />

            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                value={formData.telefonoPaciente}
                onChangeText={(text) => handleInputChange('telefonoPaciente', text)}
                keyboardType="phone-pad"
                editable={!selectedPatient}
            />

            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={formData.correoPaciente}
                onChangeText={(text) => handleInputChange('correoPaciente', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!selectedPatient}
            />

            <Text style={styles.sectionTitle}>Detalles de la Cita</Text>

            <Text style={styles.inputLabel}>Fecha *</Text>
            <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Ionicons name="calendar-outline" size={20} color="#555" />
                <Text style={styles.datePickerButtonText}>
                {formatDate(formData.fecha)}
                </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Hora *</Text>
            <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
            >
                <Ionicons name="time-outline" size={20} color="#555" />
                <Text style={styles.datePickerButtonText}>
                {formatTime(formData.fecha)}
                </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Motivo de la Consulta *</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Describa el motivo de la consulta"
                value={formData.motivo}
                onChangeText={(text) => handleInputChange('motivo', text)}
                multiline
                numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Diagnostico</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Diagnostico"
                value={formData.diagnostico}
                onChangeText={(text) => handleInputChange('diagnostico', text)}
                multiline
                numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Estado de la Cita</Text>
            <View style={styles.pickerContainer}>
                <Picker
                selectedValue={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
                style={styles.picker}
                >
                <Picker.Item label="Pendiente" value="Pendiente" />
                <Picker.Item label="Confirmada" value="Confirmada" />
                <Picker.Item label="Cancelada" value="Cancelada" />
                </Picker>
            </View>

            <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                <ActivityIndicator size="small" color="white" />
                ) : (
                <Text style={styles.submitButtonText}>Programar Cita</Text>
                )}
            </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Mostrar DatePicker */}
        {showDatePicker && (
            <DateTimePicker
            value={formData.fecha}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            />
        )}

        {/* Mostrar TimePicker */}
        {showTimePicker && (
            <DateTimePicker
            value={formData.fecha}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            />
        )}

        {/* Modal de búsqueda de pacientes */}
        <Modal
            visible={isSearchModalVisible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
                <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                </View>

                {patients.length > 0 ? (
                <ScrollView style={styles.patientsList}>
                    {patients.map((patient) => (
                    <TouchableOpacity
                        key={patient.id}
                        style={styles.patientItem}
                        onPress={() => selectPatient(patient)}
                    >
                        <View>
                        <Text style={styles.patientName}>{patient.firstName}</Text>
                        {patient.email && (
                            <Text style={styles.patientEmail}>{patient.email}</Text>
                        )}
                        {patient.phone && (
                            <Text style={styles.patientPhone}>{patient.phone}</Text>
                        )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>
                    ))}
                </ScrollView>
                ) : (
                <Text style={styles.noResults}>No se encontraron pacientes</Text>
                )}
            </View>
            </View>
        </Modal>
        </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spacer: {
    width: 24,
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  datePickerButtonText: {
    marginLeft: 10,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#41dfbf',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#41dfbf',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
  },
  selectedPatientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedPatientText: {
    color: '#388e3c',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  
  // Estilos para el modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientsList: {
    maxHeight: 400,
  },
  patientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientEmail: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  patientPhone: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
});

export default AddAppointmentScreen;