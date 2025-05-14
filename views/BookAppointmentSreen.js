import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import PatientFeaturesController from '../controllers/PatientFeaturesController';
import { LinearGradient } from 'expo-linear-gradient';

const BookAppointmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, doctorName, doctorSpecialty } = route.params || {};
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    idpaciente: auth.currentUser?.uid || '',
    iddoctor: doctorId || '',
    nombreDoctor: doctorName || '',
    especialidad: doctorSpecialty || '',
    fecha: new Date(new Date().setHours(new Date().getHours() + 1)),
    motivo: '',
    esVideoconsulta: false,
    estatus: 'Pendiente',
  });

  // Estados para los pickers de fecha y hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    // Si hay un paciente autenticado, establecer su ID en el formulario
    if (auth.currentUser) {
      setFormData(prev => ({ ...prev, idpaciente: auth.currentUser.uid }));
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
      setSelectedSlot(null); // Reset selected slot when date changes
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
      setSelectedSlot(null); // Reset selected slot when time changes manually
    }
  };

  const fetchAvailableSlots = async () => {
    if (!doctorId) {
      Alert.alert('Error', 'No se ha seleccionado un doctor');
      return;
    }

    try {
      setLoadingSlots(true);
      // Obtener solo la fecha sin la hora
      const selectedDate = new Date(formData.fecha);
      selectedDate.setHours(0, 0, 0, 0);
      
      const result = await PatientFeaturesController.getDoctorAvailableSlots(doctorId, selectedDate);
      
      if (result.success) {
        setAvailableSlots(result.data);
        setIsSlotModalVisible(true);
      } else {
        Alert.alert('Error', result.message || 'No hay horarios disponibles');
      }
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error);
      Alert.alert('Error', 'Ocurrió un problema al buscar horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectTimeSlot = (slot) => {
    const slotDate = new Date(slot.timestamp);
    setFormData(prev => ({
      ...prev,
      fecha: slotDate
    }));
    setSelectedSlot(slot);
    setIsSlotModalVisible(false);
  };

  const validateForm = () => {
    // Validación básica
    if (!formData.motivo.trim()) {
      Alert.alert('Error', 'Por favor ingrese el motivo de la consulta');
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
      
      // Asegurar que tenemos toda la información necesaria
      if (!formData.iddoctor || !formData.idpaciente) {
        throw new Error('Falta información esencial para crear la cita');
      }

      const result = await PatientFeaturesController.createAppointment(formData);
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          'Tu cita ha sido programada correctamente',
          [
            { 
              text: 'Ver mis citas', 
              onPress: () => navigation.navigate('MyAppointments')
            },
            {
              text: 'Volver al inicio',
              onPress: () => navigation.navigate('Home'),
              style: 'cancel'
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

  // Agrupar slots por hora para mostrar en el modal
  const renderTimeSlots = () => {
    if (availableSlots.length === 0) {
      return (
        <Text style={styles.noSlots}>No hay horarios disponibles para esta fecha</Text>
      );
    }

    return (
      <View style={styles.slotsContainer}>
        {availableSlots.map((slot, index) => {
          const slotDate = new Date(slot.timestamp);
          const slotTime = formatTime(slotDate);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                selectedSlot && selectedSlot.id === slot.id && styles.selectedTimeSlot
              ]}
              onPress={() => selectTimeSlot(slot)}
            >
              <Text 
                style={[
                  styles.timeSlotText,
                  selectedSlot && selectedSlot.id === slot.id && styles.selectedTimeSlotText
                ]}
              >
                {slotTime}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información del Doctor</Text>
            
            <View style={styles.doctorInfoContainer}>
              <Ionicons name="person-outline" size={40} color="#41dfbf" style={styles.doctorIcon} />
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>Dr. {formData.nombreDoctor}</Text>
                {formData.especialidad && (
                  <Text style={styles.doctorSpecialty}>{formData.especialidad}</Text>
                )}
              </View>
            </View>

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
            <View style={styles.timeSelectionContainer}>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#555" />
                <Text style={styles.datePickerButtonText}>
                  {formatTime(formData.fecha)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.slotsButton}
                onPress={fetchAvailableSlots}
                disabled={loadingSlots}
              >
                {loadingSlots ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.slotsButtonText}>Ver horarios disponibles</Text>
                )}
              </TouchableOpacity>
            </View>

            {selectedSlot && (
              <View style={styles.selectedSlotContainer}>
                <Text style={styles.selectedSlotText}>
                  Horario seleccionado: {formatTime(new Date(selectedSlot.timestamp))}
                </Text>
                <TouchableOpacity onPress={() => setSelectedSlot(null)}>
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.inputLabel}>Tipo de Consulta</Text>
            <View style={styles.consultTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.consultTypeOption,
                  !formData.esVideoconsulta && styles.selectedConsultType
                ]}
                onPress={() => handleInputChange('esVideoconsulta', false)}
              >
                <Ionicons 
                  name="medical-outline" 
                  size={20} 
                  color={!formData.esVideoconsulta ? "white" : "#555"} 
                />
                <Text 
                  style={[
                    styles.consultTypeText,
                    !formData.esVideoconsulta && styles.selectedConsultTypeText
                  ]}
                >
                  Presencial
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.consultTypeOption,
                  formData.esVideoconsulta && styles.selectedConsultType
                ]}
                onPress={() => handleInputChange('esVideoconsulta', true)}
              >
                <Ionicons 
                  name="videocam-outline" 
                  size={20} 
                  color={formData.esVideoconsulta ? "white" : "#555"} 
                />
                <Text 
                  style={[
                    styles.consultTypeText,
                    formData.esVideoconsulta && styles.selectedConsultTypeText
                  ]}
                >
                  Videoconsulta
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Motivo de la Consulta *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describa el motivo de su consulta"
              value={formData.motivo}
              onChangeText={(text) => handleInputChange('motivo', text)}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Confirmar Cita</Text>
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
            minuteInterval={15}
          />
        )}

        {/* Modal de horarios disponibles */}
        <Modal
          visible={isSlotModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Horarios Disponibles</Text>
                <TouchableOpacity onPress={() => setIsSlotModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDate}>
                Para el día {formatDate(formData.fecha)}
              </Text>
              
              <ScrollView style={styles.slotsList}>
                {renderTimeSlots()}
              </ScrollView>
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
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#41dfbf',
  },
  doctorIcon: {
    marginRight: 15,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
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
  timeSelectionContainer: {
    flexDirection: 'column',
  },
  slotsButton: {
    backgroundColor: '#41dfbf',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  slotsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedSlotText: {
    color: '#388e3c',
    flex: 1,
  },
  consultTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  consultTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  selectedConsultType: {
    backgroundColor: '#41dfbf',
    borderColor: '#41dfbf',
  },
  consultTypeText: {
    marginLeft: 8,
    color: '#555',
  },
  selectedConsultTypeText: {
    color: 'white',
    fontWeight: 'bold',
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
  modalDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  slotsList: {
    maxHeight: 300,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#41dfbf',
    borderColor: '#41dfbf',
  },
  timeSlotText: {
    color: '#333',
  },
  selectedTimeSlotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noSlots: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
});

export default BookAppointmentScreen;