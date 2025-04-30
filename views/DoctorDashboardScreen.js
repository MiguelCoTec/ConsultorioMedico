// DoctorDashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';

const DoctorDashboardScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [doctorId, setDoctorId] = useState(auth.currentUser?.uid);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
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
    }
  }, [doctorId]);

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

  const handleViewAppointments = async () => {
    if (!doctorId) return;
    
    /*
    const result = await DoctorFeaturesController.getDoctorAppointments(doctorId);
    if (result.success) {
      navigation.navigate('DoctorAppointments', { appointments: result.data });
    } else {
      Alert.alert('Error', result.message);
    }*/
    Alert.alert("Funcionalidad en proceso");
    console.log("Funcionalidad en proceso");
  };

  const handleAddAppointment = () => {
    //navigation.navigate('AddAppointment');

    Alert.alert("Funcionalidad en proceso");
    console.log("Funcionalidad en proceso");
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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <Button title="Buscar" onPress={handleSearch} />
        </View>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.patientCard}>
                <Text>{item.firstName} {item.lastName}</Text>
                <Text>Teléfono: {item.phone}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noResults}>No se encontraron pacientes</Text>
        )}

        {/* Botones de acciones */}
        <View style={styles.buttonsContainer}>
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

        {/* Botón de cerrar sesión */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

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
                  style={styles.input}
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
      </View>
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

  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
  patientCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
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

export default DoctorDashboardScreen;