import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PatientFeaturesController from '../controllers/PatientFeaturesController';

const PatientAppointmentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointment } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.log('Error formateando fecha:', error);
      return 'Formato de fecha inválido';
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return { color: '#4CAF50', fontWeight: 'bold' };
      case 'pendiente':
        return { color: '#FF9800', fontWeight: 'bold' };
      case 'cancelada':
        return { color: '#F44336', fontWeight: 'bold' };
      case 'completada':
        return { color: '#2196F3', fontWeight: 'bold' };
      default:
        return { color: '#757575', fontWeight: 'bold' };
    }
  };

  const handleCancelAppointment = async () => {
    try {
      setLoading(true);
      const updatedData = {
        estatus: 'Cancelada',
        motivoCancelacion: cancelReason || 'Cancelada por el paciente'
      };

      // Asumiendo que tenemos un método para cancelar citas desde el paciente
      const result = await PatientFeaturesController.cancelAppointment(appointment.id, updatedData);
      
      if (result && result.success) {
        Alert.alert('Éxito', 'La cita ha sido cancelada correctamente');
        setIsCancelModalVisible(false);
        
        // Actualiza la cita en la pantalla actual
        appointment.estatus = 'Cancelada';
        appointment.motivoCancelacion = cancelReason;
        
        // Opcionalmente puede navegar de vuelta o recargar datos
        navigation.goBack();
      } else {
        Alert.alert('Error', result?.message || 'No se pudo cancelar la cita');
      }
    } catch (error) {
      console.error('Error cancelando cita:', error);
      Alert.alert('Error', 'Ocurrió un error al cancelar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAppointment = () => {
    navigation.navigate('RescheduleAppointment', { appointment });
  };

  const canCancelAppointment = () => {
    // Solo se pueden cancelar citas que estén pendientes o confirmadas
    const validStatus = ['pendiente', 'confirmada'].includes(appointment?.estatus?.toLowerCase());
    
    // Verificar si la cita es en el futuro (mínimo 24 horas antes)
    let canCancel = false;
    
    if (appointment?.fecha) {
      const appointmentDate = appointment.fecha.toDate ? appointment.fecha.toDate() : new Date(appointment.fecha);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
      canCancel = hoursUntilAppointment >= 24;
    }
    
    return validStatus && canCancel;
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró información de la cita</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Información del Doctor</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{appointment.nombreDoctor || 'No especificado'}</Text>
              </View>
              
              {appointment.especialidad && (
                <View style={styles.infoRow}>
                  <Ionicons name="medkit-outline" size={20} color="#555" />
                  <Text style={styles.infoLabel}>Especialidad:</Text>
                  <Text style={styles.infoValue}>{appointment.especialidad}</Text>
                </View>
              )}
              
              {appointment.ubicacion && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#555" />
                  <Text style={styles.infoLabel}>Ubicación:</Text>
                  <Text style={styles.infoValue}>{appointment.ubicacion}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Detalles de la Cita</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Fecha:</Text>
                <Text style={styles.infoValue}>{formatDate(appointment.fecha)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Duración:</Text>
                <Text style={styles.infoValue}>{appointment.duracion || '30'} minutos</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Motivo:</Text>
                <Text style={styles.infoValue}>{appointment.motivo || 'No especificado'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Estado:</Text>
                <Text style={[styles.infoValue, getStatusStyle(appointment.estatus)]}>
                  {appointment.estatus || 'No definido'}
                </Text>
              </View>
              
              {appointment.costo && (
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={20} color="#555" />
                  <Text style={styles.infoLabel}>Costo:</Text>
                  <Text style={styles.infoValue}>${appointment.costo}</Text>
                </View>
              )}
            </View>

            {appointment.diagnostico && appointment.estatus?.toLowerCase() === 'completada' && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notas del Doctor</Text>
                <Text style={styles.notesText}>{appointment.diagnostico}</Text>
              </View>
            )}

            {/* Mostrar botones según el estado de la cita 
            {appointment.estatus?.toLowerCase() !== 'cancelada' && 
             appointment.estatus?.toLowerCase() !== 'completada' && (
              <View style={styles.buttonContainer}>
                {canCancelAppointment() && (
                  <TouchableOpacity 
                    style={styles.cancelAppointmentButton}
                    onPress={() => setIsCancelModalVisible(true)}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="white" />
                    <Text style={styles.cancelAppointmentButtonText}>Cancelar Cita</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.rescheduleButton}
                  onPress={handleRescheduleAppointment}
                >
                  <Ionicons name="calendar-outline" size={20} color="white" />
                  <Text style={styles.rescheduleButtonText}>Reagendar</Text>
                </TouchableOpacity>
              </View>
            )}*/}
            
            {/* Agregar opciones para video consulta si aplica */}
            {appointment.esVideoconsulta && appointment.estatus?.toLowerCase() === 'confirmada' && (
              <TouchableOpacity 
                style={styles.videoCallButton}
                onPress={() => navigation.navigate('VideoCall', { appointmentId: appointment.id })}
              >
                <Ionicons name="videocam-outline" size={24} color="white" />
                <Text style={styles.videoCallButtonText}>Iniciar Video Consulta</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Modal para cancelar la cita */}
        <Modal
          visible={isCancelModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cancelar Cita</Text>
              
              <Text style={styles.inputLabel}>Motivo de Cancelación</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Indique el motivo de la cancelación"
              />
              
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity 
                  style={styles.backModal}
                  onPress={() => setIsCancelModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={styles.backModalText}>Volver</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmCancelButton}
                  onPress={handleCancelAppointment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmCancelButtonText}>Confirmar Cancelación</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  infoSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cancelAppointmentButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
  cancelAppointmentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  rescheduleButton: {
    flexDirection: 'row',
    backgroundColor: '#4dabf7',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 5,
  },
  rescheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  videoCallButton: {
    flexDirection: 'row',
    backgroundColor: '#41dfbf',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  videoCallButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#41dfbf',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ff6b6b',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backModal: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  backModalText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmCancelButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  confirmCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PatientAppointmentDetailScreen;