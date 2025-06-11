import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../firebase';
import PatientFeaturesController from '../controllers/PatientFeaturesController';

const PatientAppointmentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientId, setPatientId] = useState(auth.currentUser?.uid);
  
  // Estados para la búsqueda y filtros
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadAppointments();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchText, startDate, endDate, selectedStatus, selectedSpecialty]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log(patientId);
      const result = await PatientFeaturesController.getPatientAppointments(patientId);
      
      if (result.success) {
        setAppointments(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error al cargar las citas');
      console.log('Error cargando citas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por texto (nombre del doctor, especialidad o motivo)
    if (searchText.trim()) {
      filtered = filtered.filter(appointment => 
        (appointment.nombreDoctor?.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.especialidad?.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.motivo?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      filtered = filtered.filter(appointment => {
        if (!appointment.fecha) return false;
        
        const appointmentDate = appointment.fecha.toDate ? 
          appointment.fecha.toDate() : 
          new Date(appointment.fecha);
        
        let matchesDateRange = true;
        
        if (startDate) {
          const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          matchesDateRange = matchesDateRange && appointmentDate >= start;
        }
        
        if (endDate) {
          const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          matchesDateRange = matchesDateRange && appointmentDate <= end;
        }
        
        return matchesDateRange;
      });
    }

    // Filtro por estado
    if (selectedStatus) {
      filtered = filtered.filter(appointment => 
        appointment.estatus?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Filtro por especialidad
    if (selectedSpecialty) {
      filtered = filtered.filter(appointment => 
        appointment.especialidad?.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
    setIsFiltering(searchText.trim() || startDate || endDate || selectedStatus || selectedSpecialty);
  };

  const clearFilters = () => {
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus('');
    setSelectedSpecialty('');
    setSearchModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

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

  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Confirmada', value: 'confirmada' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Completada', value: 'completada' }
  ];

  const getUpcomingAppointments = () => {
    const now = new Date();
    return filteredAppointments.filter(appointment => {
      if (!appointment.fecha) return false;
      const appointmentDate = appointment.fecha.toDate ? appointment.fecha.toDate() : new Date(appointment.fecha);
      return appointmentDate > now && appointment.estatus?.toLowerCase() !== 'cancelada';
    });
  };

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.doctorName}>
          Dr. {item.nombreDoctor || 'Doctor sin nombre'}
        </Text>
        <Text style={[styles.appointmentStatus, getStatusStyle(item.estatus)]}>
          {item.estatus || 'Estado no definido'}
        </Text>
      </View>
      
      {item.especialidad && (
        <View style={styles.appointmentDetail}>
          <Ionicons name="medkit-outline" size={16} color="#555" />
          <Text style={styles.detailText}>Especialidad: {item.especialidad}</Text>
        </View>
      )}
      
      <View style={styles.appointmentDetail}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.detailText}>Fecha: {formatDate(item.fecha)}</Text>
      </View>
      
      <View style={styles.appointmentDetail}>
        <Ionicons name="medical-outline" size={16} color="#555" />
        <Text style={styles.detailText}>Motivo: {item.motivo || 'No especificado'}</Text>
      </View>

      {item.ubicacion && (
        <View style={styles.appointmentDetail}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.detailText}>Ubicación: {item.ubicacion}</Text>
        </View>
      )}

      {item.costo && (
        <View style={styles.appointmentDetail}>
          <Ionicons name="cash-outline" size={16} color="#555" />
          <Text style={styles.detailText}>Costo: ${item.costo}</Text>
        </View>
      )}

      {item.esVideoconsulta && (
        <View style={styles.appointmentDetail}>
          <Ionicons name="videocam-outline" size={16} color="#4CAF50" />
          <Text style={[styles.detailText, { color: '#4CAF50', fontWeight: 'bold' }]}>
            Video Consulta
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.detailButton}
        onPress={() => navigation.navigate('PatientAppointmentDetail', { appointment: item })}
      >
        <Text style={styles.detailButtonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar" size={50} color="#ccc" />
      <Text style={styles.emptyText}>
        {isFiltering ? 'No se encontraron citas con los filtros aplicados' : 'No tienes citas programadas'}
      </Text>
      {isFiltering && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={searchModalVisible}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar y Filtrar Citas</Text>
            <TouchableOpacity 
              onPress={() => setSearchModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Búsqueda por texto */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Buscar por doctor, especialidad o motivo:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Nombre del doctor, especialidad o motivo..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Filtro por fechas */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Rango de fechas:</Text>
            
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateInputText}>
                {startDate ? formatDateForInput(startDate) : 'Fecha inicio'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateInputText}>
                {endDate ? formatDateForInput(endDate) : 'Fecha fin'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filtro por estado */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Estado de la cita:</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  selectedStatus === option.value && styles.statusOptionSelected
                ]}
                onPress={() => setSelectedStatus(option.value)}
              >
                <Text style={[
                  styles.statusOptionText,
                  selectedStatus === option.value && styles.statusOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Limpiar Todo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setSearchModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* DatePickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
    </Modal>
  );

  const upcomingAppointments = getUpcomingAppointments();

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
      <View style={styles.container}>
        {/* Header con botón de búsqueda y resumen */}
        <View style={styles.searchHeader}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setSearchModalVisible(true)}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.searchButtonText}>Buscar citas</Text>
          </TouchableOpacity>
          
          {isFiltering && (
            <TouchableOpacity 
              style={styles.filterIndicator}
              onPress={clearFilters}
            >
              <Ionicons name="funnel" size={16} color="#41dfbf" />
              <Text style={styles.filterCount}>{filteredAppointments.length}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resumen de próximas citas */}
        {!isFiltering && upcomingAppointments.length > 0 && (
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={20} color="#41dfbf" />
            <Text style={styles.summaryText}>
              Tienes {upcomingAppointments.length} cita{upcomingAppointments.length > 1 ? 's' : ''} próxima{upcomingAppointments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#41dfbf" />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#41dfbf']} 
              />
            }
          />
        )}

        {renderSearchModal()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41dfbf',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  searchButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#41dfbf',
  },
  filterCount: {
    marginLeft: 4,
    color: '#41dfbf',
    fontWeight: 'bold',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#41dfbf',
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  appointmentStatus: {
    fontSize: 14,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  detailButton: {
    backgroundColor: '#41dfbf',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  detailButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 15,
    backgroundColor: '#41dfbf',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  dateInputText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  statusOptionSelected: {
    backgroundColor: '#41dfbf',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
  },
  statusOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  clearButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#41dfbf',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PatientAppointmentsScreen;