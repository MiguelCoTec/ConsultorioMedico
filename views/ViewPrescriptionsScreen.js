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
  RefreshControl,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';
import { LinearGradient } from 'expo-linear-gradient';

const ViewPrescriptionsScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Estados para el formulario de edición
  const [editFormData, setEditFormData] = useState({
    idReceta: '',
    idDoctor: '',
    idPaciente: '',
    nombrePaciente: '',
    fecha: new Date(),
    medicamentos: []
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchText, prescriptions]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const doctorId = auth.currentUser?.uid;
      if (!doctorId) {
        Alert.alert('Error', 'No se pudo obtener la información del doctor');
        return;
      }

      const result = await DoctorFeaturesController.getDoctorPrescriptions(doctorId);
      if (result.success) {
        setPrescriptions(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron cargar las recetas');
      }
    } catch (error) {
      console.error('Error cargando recetas:', error);
      Alert.alert('Error', 'Ocurrió un problema al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrescriptions();
    setRefreshing(false);
  };

  const filterPrescriptions = () => {
    if (!searchText.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }

    const filtered = prescriptions.filter(prescription => 
      prescription.nombrePaciente.toLowerCase().includes(searchText.toLowerCase()) ||
      prescription.medicamentos.some(med => 
        med.nombre.toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredPrescriptions(filtered);
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openEditModal = (prescription) => {
    setSelectedPrescription(prescription);
    setEditFormData({
      idReceta: prescription.idReceta,
      idDoctor: prescription.idDoctor,
      idPaciente: prescription.idPaciente,
      nombrePaciente: prescription.nombrePaciente,
      fecha: prescription.fecha.toDate ? prescription.fecha.toDate() : new Date(prescription.fecha),
      medicamentos: [...prescription.medicamentos]
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedPrescription(null);
    setEditFormData({
      idReceta: '',
      idDoctor: '',
      idPaciente: '',
      nombrePaciente: '',
      fecha: new Date(),
      medicamentos: []
    });
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMedicamentoEdit = () => {
    setEditFormData(prev => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { nombre: '', cantidad: '', instrucciones: '' }
      ]
    }));
  };

  const removeMedicamentoEdit = (index) => {
    if (editFormData.medicamentos.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        medicamentos: prev.medicamentos.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMedicamentoEdit = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const validateEditForm = () => {
    if (!editFormData.nombrePaciente.trim()) {
      Alert.alert('Error', 'El nombre del paciente es requerido');
      return false;
    }

    const validMedicamentos = editFormData.medicamentos.filter(med => 
      med.nombre.trim() && med.cantidad.trim() && med.instrucciones.trim()
    );

    if (validMedicamentos.length === 0) {
      Alert.alert('Error', 'Debe haber al menos un medicamento con todos los datos completos');
      return false;
    }

    return true;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    try {
      setEditLoading(true);
      
      const medicamentosCompletos = editFormData.medicamentos.filter(med => 
        med.nombre.trim() && med.cantidad.trim() && med.instrucciones.trim()
      );

      const updatedData = {
        ...editFormData,
        medicamentos: medicamentosCompletos
      };

      const result = await DoctorFeaturesController.updatePrescription(
        editFormData.idReceta, 
        updatedData
      );
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          'La receta ha sido actualizada correctamente',
          [
            { 
              text: 'OK', 
              onPress: () => {
                closeEditModal();
                loadPrescriptions();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar la receta');
      }
    } catch (error) {
      console.error('Error actualizando receta:', error);
      Alert.alert('Error', 'Ocurrió un problema al actualizar la receta');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePrescription = (prescription) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar la receta de ${prescription.nombrePaciente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deletePrescription(prescription.idReceta)
        }
      ]
    );
  };

  const deletePrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      const result = await DoctorFeaturesController.deletePrescription(prescriptionId);
      
      if (result.success) {
        Alert.alert('Éxito', 'Receta eliminada correctamente');
        loadPrescriptions();
      } else {
        Alert.alert('Error', result.message || 'No se pudo eliminar la receta');
      }
    } catch (error) {
      console.error('Error eliminando receta:', error);
      Alert.alert('Error', 'Ocurrió un problema al eliminar la receta');
    } finally {
      setLoading(false);
    }
  };

  const renderPrescriptionItem = ({ item }) => (
    <View style={styles.prescriptionCard}>
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionInfo}>
          <Text style={styles.patientName}>{item.nombrePaciente}</Text>
          <Text style={styles.prescriptionDate}>
            Fecha: {formatDate(item.fecha)}
          </Text>
          <Text style={styles.medicamentCount}>
            {item.medicamentos.length} medicamento(s)
          </Text>
        </View>
        <View style={styles.prescriptionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={20} color="#41dfbf" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePrescription(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.medicamentsList}>
        {item.medicamentos.map((med, index) => (
          <View key={index} style={styles.medicamentItem}>
            <Text style={styles.medicamentName}>{med.nombre}</Text>
            <Text style={styles.medicamentDetails}>
              Cantidad: {med.cantidad}
            </Text>
            <Text style={styles.medicamentInstructions}>
              {med.instrucciones}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.container}>
        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por paciente o medicamento..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Lista de recetas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#41dfbf" />
            <Text style={styles.loadingText}>Cargando recetas...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPrescriptions}
            renderItem={renderPrescriptionItem}
            keyExtractor={(item) => item.idReceta}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#41dfbf']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No hay recetas disponibles</Text>
                <Text style={styles.emptySubtext}>
                  {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Aún no has creado ninguna receta'}
                </Text>
              </View>
            }
          />
        )}

        {/* Modal de edición */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Receta</Text>
                <TouchableOpacity onPress={closeEditModal}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.inputLabel}>Nombre del Paciente</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={editFormData.nombrePaciente}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Fecha de la Receta</Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#555" />
                  <Text style={styles.dateText}>
                    {formatDate(editFormData.fecha)}
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Medicamentos</Text>
                
                {editFormData.medicamentos.map((medicamento, index) => (
                  <View key={index} style={styles.medicamentoContainer}>
                    <View style={styles.medicamentoHeader}>
                      <Text style={styles.medicamentoTitle}>Medicamento {index + 1}</Text>
                      {editFormData.medicamentos.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeMedicamentoEdit(index)}
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
                      onChangeText={(text) => updateMedicamentoEdit(index, 'nombre', text)}
                    />

                    <Text style={styles.inputLabel}>Cantidad *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 20 tabletas, 1 frasco, etc."
                      value={medicamento.cantidad}
                      onChangeText={(text) => updateMedicamentoEdit(index, 'cantidad', text)}
                    />

                    <Text style={styles.inputLabel}>Instrucciones de Consumo *</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Ej: Tomar 1 tableta cada 8 horas después de los alimentos"
                      value={medicamento.instrucciones}
                      onChangeText={(text) => updateMedicamentoEdit(index, 'instrucciones', text)}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                ))}

                <TouchableOpacity 
                  style={styles.addMedicamentoButton}
                  onPress={addMedicamentoEdit}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#41dfbf" />
                  <Text style={styles.addMedicamentoButtonText}>Agregar Medicamento</Text>
                </TouchableOpacity>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={closeEditModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveEdit}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    )}
                  </TouchableOpacity>
                </View>
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
  searchContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  prescriptionCard: {
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
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  prescriptionInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  medicamentCount: {
    fontSize: 14,
    color: '#41dfbf',
    fontWeight: '500',
  },
  prescriptionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  medicamentsList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  medicamentItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  medicamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  medicamentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  medicamentInstructions: {
    fontSize: 14,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  // Estilos del modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '95%',
    maxHeight: '90%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    padding: 20,
  },
  
  // Estilos del formulario (reutilizados del código original)
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
    marginBottom: 20,
  },
  addMedicamentoButtonText: {
    marginLeft: 8,
    color: '#41dfbf',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#41dfbf',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ViewPrescriptionsScreen;