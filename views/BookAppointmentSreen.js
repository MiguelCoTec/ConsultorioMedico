// BookAppointmentScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../firebase';
import PatientFeaturesController from '../controllers/PatientFeaturesController';

const BookAppointmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, doctorNombreCompleto, doctorEspecialidad } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [patientId] = useState(auth.currentUser?.uid);

  // Cargar fechas disponibles al iniciar
  useEffect(() => {
    loadAvailableDates();
  }, []);

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  // Función para cargar las fechas disponibles del doctor
  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      const result = await PatientFeaturesController.getDoctorAvailableDates(doctorId);
      if (result.success) {
        // Organizar fechas en orden cronológico
        const sortedDates = result.data.sort((a, b) => new Date(a) - new Date(b));
        setAvailableDates(sortedDates);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar las fechas disponibles');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading available dates:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar las fechas disponibles');
      setLoading(false);
    }
  };

  // Función para cargar los horarios disponibles de una fecha específica
  const loadAvailableTimeSlots = async (date) => {
    try {
      setLoading(true);
      const result = await PatientFeaturesController.getDoctorAvailableTimeSlots(doctorId, date);
      if (result.success) {
        // Organizar horarios en orden cronológico
        const sortedTimeSlots = result.data.sort((a, b) => {
          const timeA = parseInt(a.split(':')[0]) * 60 + parseInt(a.split(':')[1]);
          const timeB = parseInt(b.split(':')[0]) * 60 + parseInt(b.split(':')[1]);
          return timeA - timeB;
        });
        setAvailableTimeSlots(sortedTimeSlots);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar los horarios disponibles');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading available time slots:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los horarios disponibles');
      setLoading(false);
    }
  };

  // Función para formatear la fecha para mostrarla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Función para formatear la hora para mostrarla
  const formatTime = (timeString) => {
    // Convierte el formato de 24h a 12h
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Función para verificar si una fecha es hoy o en el futuro
  const isDateValid = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date >= today;
  };

  // Función para manejar la selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reiniciar la selección de horario
  };

  // Función para manejar la selección de horario
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Función para abrir el modal de confirmación
  const handleOpenConfirmModal = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Error', 'Por favor seleccione una fecha y un horario para continuar');
      return;
    }
    setConfirmModalVisible(true);
  };

  // Función para confirmar la cita
  const handleConfirmAppointment = async () => {
    if (!patientId || !doctorId || !selectedDate || !selectedTimeSlot) {
      Alert.alert('Error', 'Faltan datos para reservar la cita');
      return;
    }

    try {
      setLoading(true);
      setConfirmModalVisible(false);

      const appointmentData = {
        patientId,
        doctorId,
        doctorName: doctorNombreCompleto,
        specialty: doctorEspecialidad,
        date: new Date(`${selectedDate}T${selectedTimeSlot}`).toISOString(),
        status: 'pendiente',
      };

      const result = await PatientFeaturesController.createAppointment(appointmentData);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Su cita ha sido reservada correctamente',
          [{ text: 'OK', onPress: () => navigation.navigate('PatientDashboard') }]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo reservar la cita');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Ocurrió un error al reservar la cita');
      setLoading(false);
    }
  };

  // Agrupar fechas por mes para mejor visualización
  const groupedDates = availableDates.reduce((groups, date) => {
    const month = new Date(date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(date);
    return groups;
  }, {});

  return (
    <LinearGradient colors={['#4a90e2', '#f4e9e9']} style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Reservar Cita</Text>
          <View style={styles.doctorInfoCard}>
            <Text style={styles.doctorName}>{doctorNombreCompleto}</Text>
            <Text style={styles.doctorSpecialty}>{doctorEspecialidad}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
          ) : (
            <>
              {/* Sección de selección de fecha */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Seleccione una fecha</Text>
                {Object.keys(groupedDates).length > 0 ? (
                  Object.entries(groupedDates).map(([month, dates]) => (
                    <View key={month} style={styles.monthContainer}>
                      <Text style={styles.monthTitle}>{month}</Text>
                      <View style={styles.datesGrid}>
                        {dates.map((date) => {
                          const isValid = isDateValid(date);
                          const isSelected = selectedDate === date;
                          return (
                            <TouchableOpacity
                              key={date}
                              style={[
                                styles.dateButton,
                                isSelected && styles.selectedDateButton,
                                !isValid && styles.disabledDateButton,
                              ]}
                              onPress={() => isValid && handleDateSelect(date)}
                              disabled={!isValid}
                            >
                              <Text
                                style={[
                                  styles.dateText,
                                  isSelected && styles.selectedDateText,
                                  !isValid && styles.disabledDateText,
                                ]}
                              >
                                {new Date(date).getDate()}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noAvailabilityText}>
                    No hay fechas disponibles para este doctor
                  </Text>
                )}
              </View>

              {/* Sección de selección de horario */}
              {selectedDate && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    Horarios disponibles para {formatDate(selectedDate)}
                  </Text>
                  {availableTimeSlots.length > 0 ? (
                    <View style={styles.timeSlotsGrid}>
                      {availableTimeSlots.map((timeSlot) => {
                        const isSelected = selectedTimeSlot === timeSlot;
                        return (
                          <TouchableOpacity
                            key={timeSlot}
                            style={[
                              styles.timeSlotButton,
                              isSelected && styles.selectedTimeSlotButton,
                            ]}
                            onPress={() => handleTimeSlotSelect(timeSlot)}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                isSelected && styles.selectedTimeSlotText,
                              ]}
                            >
                              {formatTime(timeSlot)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noAvailabilityText}>
                      No hay horarios disponibles para esta fecha
                    </Text>
                  )}
                </View>
              )}

              {/* Botón para confirmar cita */}
              {selectedDate && selectedTimeSlot && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleOpenConfirmModal}
                >
                  <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                </TouchableOpacity>
              )}

              {/* Botón para volver */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmación */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Cita</Text>
            
            <View style={styles.modalInfoContainer}>
              <Text style={styles.modalInfoLabel}>Doctor:</Text>
              <Text style={styles.modalInfoValue}>{doctorNombreCompleto}</Text>
              
              <Text style={styles.modalInfoLabel}>Especialidad:</Text>
              <Text style={styles.modalInfoValue}>{doctorEspecialidad}</Text>
              
              <Text style={styles.modalInfoLabel}>Fecha:</Text>
              <Text style={styles.modalInfoValue}>{selectedDate && formatDate(selectedDate)}</Text>
              
              <Text style={styles.modalInfoLabel}>Hora:</Text>
              <Text style={styles.modalInfoValue}>{selectedTimeSlot && formatTime(selectedTimeSlot)}</Text>
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmAppointment}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  doctorInfoCard: {
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
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4a90e2',
  },
  monthContainer: {
    marginBottom: 15,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dateButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    margin: 5,
  },
  selectedDateButton: {
    backgroundColor: '#4a90e2',
  },
  disabledDateButton: {
    backgroundColor: '#e0e0e0',
  },
  dateText: {
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: 'white',
  },
  disabledDateText: {
    color: '#999',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 5,
  },
  selectedTimeSlotButton: {
    backgroundColor: '#4a90e2',
  },
  timeSlotText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  noAvailabilityText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4a90e2',
  },
  modalInfoContainer: {
    marginBottom: 20,
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BookAppointmentScreen;