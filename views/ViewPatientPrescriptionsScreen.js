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
import PatientFeaturesController from '../controllers/PatientFeaturesController';
import { LinearGradient } from 'expo-linear-gradient';

const ViewPatientPrescriptionsScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchText, prescriptions]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const patientId = auth.currentUser?.uid;
      if (!patientId) {
        Alert.alert('Error', 'No se pudo obtener la información del paciente');
        return;
      }

      const result = await PatientFeaturesController.getPatientPrescriptions(patientId);
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
      prescription.nombreDoctor?.toLowerCase().includes(searchText.toLowerCase()) ||
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

  const openDetailModal = (prescription) => {
    setSelectedPrescription(prescription);
    setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedPrescription(null);
  };

  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.prescriptionCard}
      onPress={() => openDetailModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionInfo}>
          <Text style={styles.doctorName}>
            Dr. {item.nombreDoctor || 'Nombre no disponible'}
          </Text>
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
            onPress={() => openDetailModal(item)}
          >
            <Ionicons name="eye-outline" size={20} color="#41dfbf" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.medicamentsList}>
        {item.medicamentos.slice(0, 2).map((med, index) => (
          <View key={index} style={styles.medicamentItem}>
            <Text style={styles.medicamentName}>{med.nombre}</Text>
            <Text style={styles.medicamentDetails}>
              Cantidad: {med.cantidad}
            </Text>
          </View>
        ))}
        {item.medicamentos.length > 2 && (
          <Text style={styles.moreItemsText}>
            y {item.medicamentos.length - 2} medicamento(s) más...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.container}>
        {/* Header 
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Recetas Médicas</Text>
        </View>*/}

        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por doctor o medicamento..."
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
                  {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Aún no tienes recetas médicas registradas'}
                </Text>
              </View>
            }
          />
        )}

        {/* Modal de detalle */}
        <Modal
          visible={isDetailModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalle de Receta</Text>
                <TouchableOpacity onPress={closeDetailModal}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {selectedPrescription && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Doctor:</Text>
                      <Text style={styles.detailValue}>
                        Dr. {selectedPrescription.nombreDoctor || 'Nombre no disponible'}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Fecha de prescripción:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedPrescription.fecha)}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Paciente:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPrescription.nombrePaciente || 'Tu nombre'}
                      </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Medicamentos Prescritos</Text>
                    
                    {selectedPrescription.medicamentos.map((medicamento, index) => (
                      <View key={index} style={styles.medicamentoDetailContainer}>
                        <Text style={styles.medicamentoDetailTitle}>
                          {index + 1}. {medicamento.nombre}
                        </Text>
                        
                        <View style={styles.medicamentoDetailInfo}>
                          <Text style={styles.medicamentoDetailLabel}>Cantidad:</Text>
                          <Text style={styles.medicamentoDetailText}>
                            {medicamento.cantidad}
                          </Text>
                        </View>

                        <View style={styles.medicamentoDetailInfo}>
                          <Text style={styles.medicamentoDetailLabel}>Instrucciones:</Text>
                          <Text style={styles.medicamentoDetailText}>
                            {medicamento.instrucciones}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.noticeContainer}>
                      <Ionicons name="information-circle-outline" size={20} color="#41dfbf" />
                      <Text style={styles.noticeText}>
                        Sigue las instrucciones del médico. Si tienes dudas, consulta con tu doctor.
                      </Text>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeDetailModal}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  doctorName: {
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
  },
  moreItemsText: {
    fontSize: 14,
    color: '#41dfbf',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
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
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  medicamentoDetailContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  medicamentoDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  medicamentoDetailInfo: {
    marginBottom: 8,
  },
  medicamentoDetailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  medicamentoDetailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f8f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#41dfbf',
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeButton: {
    backgroundColor: '#41dfbf',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ViewPatientPrescriptionsScreen;