import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebase';
import DoctorFeaturesController from '../controllers/DoctorFeaturesController';
import { doc } from 'firebase/firestore';

const DoctorAppointmentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctorId, setDoctorId] = useState(auth.currentUser?.uid);
  //const { appointments: initialAppointments, doctorId } = route.params || {};

  useEffect(() => {
    if (doctorId) {
      loadAppointments();
      //console.log("Entra en el segundo", doctorId);
    } else {
      setLoading(false);
      //console.log("Entra en el tercero", doctorId);
    }
  }, [doctorId]);

  const loadAppointments = async () => {
    
    try {
      setLoading(true);
      console.log(doctorId);
      const result = await DoctorFeaturesController.getDoctorAppointments(doctorId);
      
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

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.patientName}>
          {item.nombrePaciente || 'Paciente sin nombre'}
        </Text>
        <Text style={[styles.appointmentStatus, getStatusStyle(item.estatus)]}>
          {item.estatus || 'Estado no definido'}
        </Text>
      </View>
      
      <View style={styles.appointmentDetail}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.detailText}>Fecha: {formatDate(item.fecha)}</Text>
      </View>
      
      <View style={styles.appointmentDetail}>
        <Ionicons name="medical-outline" size={16} color="#555" />
        <Text style={styles.detailText}>Motivo: {item.motivo || 'No especificado'}</Text>
      </View>
      
      {item.notas && (
        <View style={styles.appointmentDetail}>
          <Ionicons name="document-text-outline" size={16} color="#555" />
          <Text style={styles.detailText}>Notas: {item.notas}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.detailButton}
        onPress={() => navigation.navigate('AppointmentDetail', { appointment: item })}
      >
        <Text style={styles.detailButtonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar" size={50} color="#ccc" />
      <Text style={styles.emptyText}>No hay citas programadas</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#41dfbf', '#f4e9e9']} style={styles.container}>
        <View style={styles.container}>
            
        
        
        {loading ? (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#41dfbf" />
            <Text style={styles.loadingText}>Cargando citas...</Text>
            </View>
        ) : (
            <FlatList
            data={appointments}
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
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default DoctorAppointmentsScreen;