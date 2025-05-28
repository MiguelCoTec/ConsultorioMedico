import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';
import { LinearGradient } from 'expo-linear-gradient';

const AddPrescriptionScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  // Estados para los campos del formulario de receta
  const [formData, setFormData] = useState({
    idDoctor: auth.currentUser?.uid || '',
    idPaciente: '',
    nombrePaciente: '',
    fecha: new Date(),
    medicamentos: [
      {
        nombre: '',
        cantidad: '',
        instrucciones: ''
      }
    ]
  });

  useEffect(() => {
    // Si hay un doctor autenticado, establecer su ID en el formulario
    if (auth.currentUser) {
      setFormData(prev => ({ ...prev, idDoctor: auth.currentUser.uid }));
    }
  }, [auth.currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Funciones para manejar medicamentos
  const addMedicamento = () => {
    setFormData(prev => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { nombre: '', cantidad: '', instrucciones: '' }
      ]
    }));
  };

  const removeMedicamento = (index) => {
    if (formData.medicamentos.length > 1) {
      setFormData(prev => ({
        ...prev,
        medicamentos: prev.medicamentos.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMedicamento = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Funciones para búsqueda de pacientes (reutilizadas del código original)
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
      idPaciente: patient.userId || '',
    }));
    setIsSearchModalVisible(false);
  };

  const validateForm = () => {
    // Validación básica
    if (!formData.nombrePaciente.trim()) {
      Alert.alert('Error', 'Por favor seleccione un paciente');
      return false;
    }

    if (!formData.idPaciente) {
      Alert.alert('Error', 'Por favor seleccione un paciente válido');
      return false;
    }

    // Validar que al menos haya un medicamento con datos completos
    const validMedicamentos = formData.medicamentos.filter(med => 
      med.nombre.trim() && med.cantidad.trim() && med.instrucciones.trim()
    );

    if (validMedicamentos.length === 0) {
      Alert.alert('Error', 'Por favor agregue al menos un medicamento con todos los datos completos');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Filtrar solo medicamentos con datos completos
      const medicamentosCompletos = formData.medicamentos.filter(med => 
        med.nombre.trim() && med.cantidad.trim() && med.instrucciones.trim()
      );

      const recetaData = {
        idDoctor: formData.idDoctor,
        idPaciente: formData.idPaciente,
        nombrePaciente: formData.nombrePaciente,
        fecha: formData.fecha,
        medicamentos: medicamentosCompletos
      };

      const result = await DoctorFeaturesController.createPrescription(recetaData);
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          'La receta ha sido creada correctamente',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo crear la receta');
      }
    } catch (error) {
      console.error('Error creando receta:', error);
      Alert.alert('Error', 'Ocurrió un problema al crear la receta');
    } finally {
      setLoading(false);
    }
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
                      idPaciente: '',
                    }));
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.inputLabel}>Nombre del Paciente *</Text>
            <TextInput
              style={[styles.input, !selectedPatient && styles.inputDisabled]}
              placeholder="Seleccione un paciente"
              value={formData.nombrePaciente}
              editable={false}
            />

            <Text style={styles.inputLabel}>Fecha de la Receta</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.dateText}>
                {formatDate(formData.fecha)}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Medicamentos</Text>
            
            {formData.medicamentos.map((medicamento, index) => (
              <View key={index} style={styles.medicamentoContainer}>
                <View style={styles.medicamentoHeader}>
                  <Text style={styles.medicamentoTitle}>Medicamento {index + 1}</Text>
                  {formData.medicamentos.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeMedicamento(index)}
                      style={styles.removeMedicamentoButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.inputLabel}>Nombre del Medicamento *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Paracetamol 500mg"
                  value={medicamento.nombre}
                  onChangeText={(text) => updateMedicamento(index, 'nombre', text)}
                />

                <Text style={styles.inputLabel}>Cantidad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 20 tabletas, 1 frasco, etc."
                  value={medicamento.cantidad}
                  onChangeText={(text) => updateMedicamento(index, 'cantidad', text)}
                />

                <Text style={styles.inputLabel}>Instrucciones de Consumo *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ej: Tomar 1 tableta cada 8 horas después de los alimentos"
                  value={medicamento.instrucciones}
                  onChangeText={(text) => updateMedicamento(index, 'instrucciones', text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}

            <TouchableOpacity 
              style={styles.addMedicamentoButton}
              onPress={addMedicamento}
            >
              <Ionicons name="add-circle-outline" size={20} color="#41dfbf" />
              <Text style={styles.addMedicamentoButtonText}>Agregar Medicamento</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Crear Receta</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

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
  inputDisabled: {
    backgroundColor: '#e9e9e9',
    color: '#888',
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
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
  
  // Estilos para medicamentos
  medicamentoContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  medicamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicamentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeMedicamentoButton: {
    padding: 5,
  },
  addMedicamentoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#41dfbf',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
  },
  addMedicamentoButtonText: {
    marginLeft: 8,
    color: '#41dfbf',
    fontWeight: 'bold',
  },
  
  // Estilos para el modal (reutilizados del código original)
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

export default AddPrescriptionScreen;