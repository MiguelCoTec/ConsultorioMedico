// PatientDashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import PatientFeaturesController from '../controllers/PatientFeaturesController';

const PatientDashboardScreen = () => {
  const navigation = useNavigation();
  const [patientId, setPatientId] = useState(auth.currentUser?.uid);
  const [patientProfile, setPatientProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isAppointmentDetailsModalVisible, setIsAppointmentDetailsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  // Cargar los datos del paciente al iniciar
  useEffect(() => {
    if (patientId) {
      loadPatientProfile();
      loadPatientAppointments();
    }
  }, [patientId]);

  const loadPatientProfile = async () => {
    try {
      const result = await PatientFeaturesController.getPatientProfile(patientId);
      if (result.success) {
        setPatientProfile(result.data);
        // Inicializar el formulario con los datos actuales
        setEditFormData({
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          birthDate: result.data.birthDate || '',
          //address: result.data.address || '',
        });
      } else {
        Alert.alert('Error', result.message || 'No se pudo cargar el perfil del paciente');
      }
    } catch (error) {
      console.error('Error loading patient profile:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil');
    }
  };

  const loadPatientAppointments = async () => {
    try {
      const result = await PatientFeaturesController.getPatientAppointments(patientId);
      if (result.success) {
        setAppointments(result.data);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar las citas');
      }
    } catch (error) {
      console.error('Error loading patient appointments:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar las citas');
    }
  };

  const handleSearchDoctors = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Por favor ingrese un término de búsqueda');
      return;
    }

    const result = await PatientFeaturesController.searchDoctors(searchTerm);
    if (result.success) {
      setSearchResults(result.data);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleBookAppointment = (doctorId, doctorNombre, doctorApellido, doctorEspecialidad) => {
    doctorNombreCompleto = `${doctorNombre} ${doctorApellido}`;
    //navigation.navigate('BookAppointment', { doctorId, doctorNombreCompleto, doctorEspecialidad });
    Alert.alert("Funcionalidad en proceso");
    console.log("Funcionalidad en proceso");
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsModalVisible(true);
  };

  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'Confirmar Cancelación',
      '¿Está seguro que desea cancelar esta cita?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              const result = await PatientFeaturesController.cancelAppointment(appointmentId);
              if (result.success) {
                Alert.alert('Éxito', 'Cita cancelada correctamente');
                setIsAppointmentDetailsModalVisible(false);
                loadPatientAppointments(); // Recargar las citas
              } else {
                Alert.alert('Error', result.message || 'No se pudo cancelar la cita');
              }
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert('Error', 'Ocurrió un error al cancelar la cita');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Función para abrir el modal de edición de perfil
  const handleEditProfile = () => {
    setIsEditProfileModalVisible(true);
  };

  // Función para manejar los cambios en el formulario
  const handleInputChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value,
    });
  };

  // Función para guardar los cambios del perfil
  const handleSaveProfile = async () => {
    try {
      const result = await PatientFeaturesController.updatePatientProfile(patientId, editFormData);
      if (result.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setIsEditProfileModalVisible(false);
        loadPatientProfile(); // Recargar el perfil actualizado
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating patient profile:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        Alert.alert('Error', 'No se pudo cerrar sesión: ' + error.message);
      });
  };

  // Formatear la fecha para mostrarla
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewAppointments = async () => {
      if (!patientId) return;
      
      
      const result = await PatientFeaturesController.getPatientAppointments(patientId);
      if (result.success) {
        navigation.navigate('PatientAppointments', { appointments: result.data });
      } else {
        Alert.alert('Error', result.message);
        console.log('Error', result.message);
      }
      //Alert.alert("Funcionalidad en proceso");
      //console.log("Funcionalidad en proceso");
    };

  const handleViewPrescriptions = async () => {
    navigation.navigate('ViewPatientPrescriptions');
  }

  return (
    <LinearGradient colors={['#4a90e2', '#f4e9e9']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Mi Portal de Paciente</Text>

          {/* Información del Paciente */}
          {patientProfile && (
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{patientProfile.firstName} {patientProfile.lastName}</Text>
              <Text style={styles.profileInfo}>Email: {patientProfile.email}</Text>
              <Text style={styles.profileInfo}>Teléfono: {patientProfile.phone || 'No especificado'}</Text>
              <Text style={styles.profileInfo}>Fecha de nacimiento: {patientProfile.birthDate ? new Date(patientProfile.birthDate).toLocaleDateString() : 'No especificada'}</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Mis Citas */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleViewAppointments}
            >
            <Text style={styles.buttonText}>Ver Citas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleViewPrescriptions}
            >
            <Text style={styles.buttonText}>Ver Recetas</Text>
            </TouchableOpacity>
          </View>
          
          {/* Buscador de doctores */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Buscar Doctores</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearchDoctors}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
          </View>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.doctorCard}>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>Dr. {item.firstName} {item.lastName}</Text>
                      <Text style={styles.doctorSpecialty}>{item.specialty || 'No especificada'}</Text>
                      <Text style={styles.doctorContact}>Contacto: {item.phone || 'No disponible'}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.bookButton}
                      onPress={() => handleBookAppointment(item.id, item.firstName, item.lastName, item.specialty)}
                    >
                      <Text style={styles.bookButtonText}>Reservar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              searchTerm.length > 0 && <Text style={styles.noResults}>No se encontraron doctores</Text>
            )}
          </View>

          {/* Botón de cerrar sesión */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para editar perfil */}
      <Modal
        visible={isEditProfileModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Mi Perfil</Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
              />
              
              <Text style={styles.inputLabel}>Apellido:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
              />
              
              <Text style={styles.inputLabel}>Correo electrónico:</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={editFormData.email}
                editable={false}
              />
              
              <Text style={styles.inputLabel}>Teléfono:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Fecha de nacimiento:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.birthDate}
                onChangeText={(value) => handleInputChange('birthDate', value)}
                placeholder="DD/MM/AAAA"
              />
            </ScrollView>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para detalles de cita */}
      <Modal
        visible={isAppointmentDetailsModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedAppointment && (
              <>
                <Text style={styles.modalTitle}>Detalles de Cita</Text>
                
                <View style={styles.appointmentDetailItem}>
                  <Text style={styles.detailLabel}>Doctor:</Text>
                  <Text style={styles.detailValue}>Dr. {selectedAppointment.doctorName}</Text>
                </View>
                
                <View style={styles.appointmentDetailItem}>
                  <Text style={styles.detailLabel}>Especialidad:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.specialty || 'No especificada'}</Text>
                </View>
                
                <View style={styles.appointmentDetailItem}>
                  <Text style={styles.detailLabel}>Fecha y hora:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedAppointment.date)}</Text>
                </View>
                
                <View style={styles.appointmentDetailItem}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[
                    styles.detailValue,
                    selectedAppointment.status === 'confirmada' ? styles.statusConfirmed : 
                    selectedAppointment.status === 'cancelada' ? styles.statusCanceled : 
                    styles.statusPending
                  ]}>
                    {selectedAppointment.status === 'confirmada' ? 'Confirmada' : 
                     selectedAppointment.status === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                  </Text>
                </View>
                
                {selectedAppointment.notes && (
                  <View style={styles.appointmentDetailItem}>
                    <Text style={styles.detailLabel}>Notas:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.notes}</Text>
                  </View>
                )}
                
                <View style={styles.appointmentDetailItem}>
                  <Text style={styles.detailLabel}>Ubicación:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.location || 'Consulta principal'}</Text>
                </View>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsAppointmentDetailsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                  
                  {selectedAppointment.status !== 'cancelada' && (
                    <TouchableOpacity
                      style={styles.cancelApptButton}
                      onPress={() => handleCancelAppointment(selectedAppointment.id)}
                    >
                      <Text style={styles.cancelApptButtonText}>Cancelar Cita</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#41dfbf',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  
  // Estilos para la tarjeta de perfil
  profileCard: {
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
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  editProfileButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Estilos para secciones
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  
  // Estilos para citas
  appointmentsList: {
    marginBottom: 10,
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  appointmentDoctor: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  appointmentStatus: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusPending: {
    color: '#f39c12',
  },
  statusConfirmed: {
    color: '#2ecc71',
  },
  statusCanceled: {
    color: '#e74c3c',
  },
  appointmentDate: {
    color: '#666',
    marginBottom: 5,
  },
  appointmentSpecialty: {
    fontStyle: 'italic',
    color: '#888',
  },
  noAppointments: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  
  // Estilos para buscador
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Estilos para resultados de doctores
  doctorCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 5,
  },
  doctorContact: {
    color: '#888',
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  
  // Estilos para el botón de cerrar sesión
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
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
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#888',
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
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Estilos para detalles de cita
  appointmentDetailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 15,
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  cancelApptButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelApptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PatientDashboardScreen;