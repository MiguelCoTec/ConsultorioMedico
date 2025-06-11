// DoctorDashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../Notifications';


const DoctorDashboardScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [doctorId, setDoctorId] = useState(auth.currentUser?.uid);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isSmsModalVisible, setIsSmsModalVisible] = useState(false);
  const [selectedPatientPhone, setSelectedPatientPhone] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    license: '',
  });

  // Cargar los datos del doctor al iniciar
  useEffect(() => {
    if (doctorId) {
      loadDoctorProfile();
      registerForPushNotificationsAsync(); // Solicitar permisos
      checkAndNotify(); // Tu lógica personalizada
    }
  }, [doctorId]);

  const checkAndNotify = async () => {
    try {
      const apptResult = await DoctorFeaturesController.getDoctorAppointments(doctorId);
      //const recetaResult = await DoctorFeaturesController.getPatientPrescriptions(patientId);
  
      
      const pendientes = apptResult.success ? apptResult.data.filter(c => c.estatus === 'Pendiente') : [];
      //const activas = recetaResult.success ? recetaResult.data.filter(r => r.activa) : [];

      if (pendientes.length > 0) {
        await sendLocalNotification(
          'Citas pendientes',
          `Tienes ${pendientes.length} cita(s) sin confirmar.`
        );
      }

      // if (activas.length > 0) {
      //   await sendLocalNotification(
      //     'Recetas activas',
      //     `Tienes ${activas.length} receta(s) disponibles.`
      //   );
      // }
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  };

  const loadDoctorProfile = async () => {
    try {
      const result = await DoctorFeaturesController.getDoctorProfile(doctorId);
      if (result.success) {
        setDoctorProfile(result.data);
        // Inicializar el formulario con los datos actuales
        setEditFormData({
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          specialty: result.data.specialty || '',
          license: result.data.license || '',
        });
      } else {
        Alert.alert('Error', result.message || 'No se pudo cargar el perfil del doctor');
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Por favor ingrese un término de búsqueda');
      return;
    }

    const result = await DoctorFeaturesController.searchPatients(searchTerm);
    if (result.success) {
      setSearchResults(result.data);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  // Función para hacer llamadas telefónicas
  const handleCalling = async (phoneNumber) => {
  if (!phoneNumber) {
    Alert.alert('Error', 'Número de teléfono no disponible');
    return;
  }

  // Limpiar el número de teléfono (remover espacios, guiones, etc.)
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Crear la URL para la llamada
  const phoneUrl = `tel:${cleanPhoneNumber}`;

  try {
    // En dispositivos físicos, a veces canOpenURL falla para tel:
    // Es mejor intentar directamente la llamada con manejo de errores
    Alert.alert(
      'Realizar llamada',
      `¿Desea llamar al número ${phoneNumber}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Llamar',
          onPress: async () => {
            try {
              await Linking.openURL(phoneUrl);
            } catch (error) {
              console.error('Error al realizar la llamada:', error);
              Alert.alert('Error', 'No se pudo realizar la llamada. Verifique que el dispositivo tenga capacidad de llamadas.');
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('Error in handleCalling:', error);
    Alert.alert('Error', 'Ocurrió un error al intentar realizar la llamada');
  }
};

  // Función para abrir el modal de SMS
  const handleOpenSmsModal = (phoneNumber, patientName) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Número de teléfono no disponible');
      return;
    }
    
    setSelectedPatientPhone(phoneNumber);
    setSelectedPatientName(patientName);
    setSmsMessage('');
    setIsSmsModalVisible(true);
  };

  // Función para enviar SMS
  const handleSendSms = async () => {
    if (!smsMessage.trim()) {
      Alert.alert('Error', 'Por favor escriba un mensaje');
      return;
    }

    if (!selectedPatientPhone) {
      Alert.alert('Error', 'Número de teléfono no disponible');
      return;
    }

    // Limpiar el número de teléfono
    const cleanPhoneNumber = selectedPatientPhone.replace(/[^\d+]/g, '');
    
    // Crear la URL para SMS con el mensaje
    const smsUrl = `sms:${cleanPhoneNumber}?body=${encodeURIComponent(smsMessage)}`;

    try {
      // Verificar si el dispositivo puede enviar SMS
      const canSendSms = await Linking.canOpenURL(smsUrl);
      // Abrir la aplicación de SMS con el mensaje prellenado
      await Linking.openURL(smsUrl);
      setIsSmsModalVisible(false);
      setSmsMessage('');
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar enviar el mensaje');
    }
  };

  const handleViewAppointments = async () => {
    if (!doctorId) return;
    
    
    const result = await DoctorFeaturesController.getDoctorAppointments(doctorId);
    if (result.success) {
      navigation.navigate('DoctorAppointments', { appointments: result.data });
    } else {
      Alert.alert('Error', result.message);
      console.log('Error', result.message);
    }
    //Alert.alert("Funcionalidad en proceso");
    //console.log("Funcionalidad en proceso");
  };

  const handleAddAppointment = () => {
    navigation.navigate('AddAppointment');

    //Alert.alert("Funcionalidad en proceso");
    //console.log("Funcionalidad en proceso");
  };

  const handleAddPrescription = () => {
    navigation.navigate('AddPrescription');
  }

  const handleViewPrescriptions = () => {
    navigation.navigate('ViewPrescription');
  }

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
      const result = await DoctorFeaturesController.updateDoctorProfile(doctorId, editFormData);
      if (result.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setIsEditProfileModalVisible(false);
        loadDoctorProfile(); // Recargar el perfil actualizado
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating doctor profile:', error);
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

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Panel del Doctor</Text>

          {/* Información del Doctor */}
          {doctorProfile && (
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>Dr. {doctorProfile.firstName} {doctorProfile.lastName}</Text>
              <Text style={styles.profileInfo}>Especialidad: {doctorProfile.specialty || 'No especificada'}</Text>
              <Text style={styles.profileInfo}>Teléfono: {doctorProfile.phone || 'No especificado'}</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Buscador de pacientes */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Buscar Pacientes</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.patientCard}>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
                      <Text style={styles.patientContact}>Teléfono: {item.phone || 'No disponible'}</Text>
                      <Text style={styles.patientContact}>Email: {item.email || 'No disponible'}</Text>
                      
                    </View>
                    
                    <View style={styles.patientButtonsContainer}>
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCalling(item.phone)}
                      >
                        <Text style={styles.buttonText}>Llamar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.smsButton}
                        onPress={() => handleOpenSmsModal(item.phone, `${item.firstName} ${item.lastName}`)}
                      >
                        <Text style={styles.buttonText}>SMS</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              searchTerm.length > 0 && <Text style={styles.noResults}>No se encontraron pacientes</Text>
            )}
          </View>

          {/* Botones de acciones */}
          <View style={styles.buttonsContainer}>
            {/* Primera fila con dos botones */}
            <View style={styles.rowButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleViewAppointments}
              >
                <Text style={styles.buttonText}>Ver Citas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleAddAppointment}
              >
                <Text style={styles.buttonText}>Agregar Cita</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowButtons}>
              <TouchableOpacity 
              style={[styles.actionButton]}
              onPress={handleAddPrescription}
            >
              <Text style={styles.buttonText}>Agregar Receta</Text>
            </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleViewPrescriptions}
              >
                <Text style={styles.buttonText}>Ver Recetas</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
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
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                editable={false} // No permitir cambiar el email ya que está vinculado a la autenticación
              />
              
              <Text style={styles.inputLabel}>Teléfono:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Especialidad:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.specialty}
                onChangeText={(value) => handleInputChange('specialty', value)}
              />
              
              <Text style={styles.inputLabel}>Número de Licencia:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.license}
                onChangeText={(value) => handleInputChange('license', value)}
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

      {/* Modal para enviar SMS */}
      <Modal
        visible={isSmsModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar SMS</Text>
            <Text style={styles.smsRecipient}>Para: {selectedPatientName}</Text>
            <Text style={styles.smsPhone}>Número: {selectedPatientPhone}</Text>
            
            <Text style={styles.inputLabel}>Mensaje:</Text>
            <TextInput
              style={styles.smsTextArea}
              value={smsMessage}
              onChangeText={setSmsMessage}
              placeholder="Escriba su mensaje aquí..."
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={160}
            />
            
            <Text style={styles.characterCount}>
              {smsMessage.length}/160 caracteres
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsSmsModalVisible(false);
                  setSmsMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sendSmsButton}
                onPress={handleSendSms}
              >
                <Text style={styles.sendSmsButtonText}>Enviar SMS</Text>
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
    backgroundColor: '#2196F3',
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
    backgroundColor: '#41dfbf',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Estilos para resultados de pacientes
  patientCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  patientContact: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  patientButtonsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  
  buttonsContainer: {
    marginTop: 20,
  },

  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  actionButton: {
    backgroundColor: '#41dfbf',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },

  singleButton: {
    width: '100%',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  callButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  smsButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },

  // Estilos para el botón de cerrar sesión
  logoutButton: {
    backgroundColor: '#ff6b6b',
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

  // Estilos para el modal de SMS
  smsRecipient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  smsPhone: {
    fontSize: 14,
    marginBottom: 15,
    color: '#666',
  },
  smsTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 15,
  },
  sendSmsButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  sendSmsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DoctorDashboardScreen;