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
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';

const AppointmentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointment } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [notes, setNotes] = useState(appointment?.diagnostico || '');
  const [status, setStatus] = useState(appointment?.estatus || 'Pendiente');

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

  const handleUpdateAppointment = async () => {
    try {
      setLoading(true);
      const updatedData = {
        estatus: status,
        diagnostico: notes
      };

      // Asumiendo que tenemos un método para actualizar citas
      const result = await DoctorFeaturesController.updateAppointment(appointment.id, updatedData);
      
      if (result && result.success) {
        Alert.alert('Éxito', 'La cita ha sido actualizada correctamente');
        setIsEditModalVisible(false);
        
        // Actualiza la cita en la pantalla actual
        appointment.estatus = status;
        appointment.diagnostico = notes;
        
        // Opcionalmente puede navegar de vuelta o recargar datos
        // navigation.goBack();
      } else {
        Alert.alert('Error', result?.message || 'No se pudo actualizar la cita');
      }
    } catch (error) {
      console.error('Error actualizando cita:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusOptions = () => {
    const statuses = ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'];
    
    return (
      <View style={styles.statusOptionsContainer}>
        {statuses.map((statusOption) => (
          <TouchableOpacity
            key={statusOption}
            style={[
              styles.statusOption,
              status === statusOption && styles.selectedStatusOption
            ]}
            onPress={() => setStatus(statusOption)}
          >
            <Text
              style={[
                styles.statusOptionText,
                status === statusOption && styles.selectedStatusOptionText
              ]}
            >
              {statusOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
                <Text style={styles.sectionTitle}>Información del Paciente</Text>
                
                <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#555" />
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{appointment.nombrePaciente || 'No especificado'}</Text>
                </View>
                
                {appointment.telefonoPaciente && (
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#555" />
                    <Text style={styles.infoLabel}>Teléfono:</Text>
                    <Text style={styles.infoValue}>{appointment.telefonoPaciente}</Text>
                </View>
                )}
                
                {appointment.email && (
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color="#555" />
                    <Text style={styles.infoLabel}>Correo:</Text>
                    <Text style={styles.infoValue}>{appointment.email}</Text>
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
                
                {appointment.especialidad && (
                <View style={styles.infoRow}>
                    <Ionicons name="medkit-outline" size={20} color="#555" />
                    <Text style={styles.infoLabel}>Especialidad:</Text>
                    <Text style={styles.infoValue}>{appointment.especialidad}</Text>
                </View>
                )}
            </View>

            {appointment.diagnostico && (
                <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <Text style={styles.notesText}>{appointment.diagnostico}</Text>
                </View>
            )}

            <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditModalVisible(true)}
            >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Editar Cita</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Modal para editar la cita */}
        <Modal
            visible={isEditModalVisible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Actualizar Cita</Text>
                
                <Text style={styles.inputLabel}>Estado de la cita</Text>
                {renderStatusOptions()}
                
                <Text style={styles.inputLabel}>Notas</Text>
                <TextInput
                style={styles.notesInput}
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="Añadir notas sobre la cita"
                />
                
                <View style={styles.modalButtonsContainer}>
                <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setIsEditModalVisible(false)}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleUpdateAppointment}
                    disabled={loading}
                >
                    {loading ? (
                    <ActivityIndicator size="small" color="white" />
                    ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
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
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#41dfbf',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
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
  backButtonText: {
    color: '#41dfbf',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
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
  statusOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    margin: 5,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedStatusOption: {
    backgroundColor: '#41dfbf',
    borderColor: '#41dfbf',
  },
  statusOptionText: {
    color: '#555',
  },
  selectedStatusOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  saveButton: {
    backgroundColor: '#41dfbf',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AppointmentDetailScreen;