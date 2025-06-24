import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useSocket } from '../context/SocketContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function TrackingScreen({ route, navigation }) {
  const { orderId } = route.params; // Get orderId from navigation params
  const { socket, isConnected } = useSocket();

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  // Dummy initial region (Jakarta example)
  const [region, setRegion] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    fetchOrderDetails();

    if (isConnected && socket) {
      // Listen for real-time driver location updates
      socket.on('driver_location_update', (data) => {
        if (data.orderId === orderId) {
          setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
          // Optionally animate map to driver's location
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: { latitude: data.latitude, longitude: data.longitude },
              zoom: 15,
            }, { duration: 1000 });
          }
        }
      });

      // Listen for order status updates relevant to tracking
      socket.on('order_status_update', (data) => {
        if (data.orderId === orderId) {
          setOrder(prevOrder => ({ ...prevOrder, status: data.newStatus }));
          Alert.alert('Update Pesanan', data.message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('driver_location_update');
        socket.off('order_status_update');
      }
    };
  }, [isConnected, socket, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }, // Assume userToken from context
      });
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        // Set initial map region based on order delivery address (requires geocoding or hardcoded for MVP)
        // For now, let's assume deliveryAddress can be parsed to lat/lng or use a dummy
        // In a real app, you'd store lat/lng in Order schema or use a geocoding API here
        setRegion(prev => ({
            ...prev,
            latitude: -6.2088, // Dummy delivery latitude
            longitude: 106.8456, // Dummy delivery longitude
        }));

        // TODO: Also fetch initial driver location if available at order acceptance
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat detail pesanan.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat detail pesanan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat pesanan...</Text>
      </View>
    );
  }

  const deliveryLocation = {
    latitude: region.latitude, // Using region's latitude for delivery for simplicity
    longitude: region.longitude,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lacak Pesanan #{orderId.substring(0, 4)}...</Text>
        <View style={{ width: Theme.fontSizes.xlarge }} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        followsUserLocation={true} // Follow user for debugging, usually not for tracking driver
      >
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Posisi Driver"
            description={order.itemDescription}
            pinColor={Colors.secondary} // Cyan
          >
            <Ionicons name="car" size={30} color={Colors.secondary} />
          </Marker>
        )}
        {deliveryLocation && (
          <Marker
            coordinate={deliveryLocation}
            title="Lokasi Anda"
            description={order.deliveryAddress}
            pinColor={Colors.primary} // Navy
          >
            <Ionicons name="location" size={30} color={Colors.primary} />
          </Marker>
        )}
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.statusText}>{order.status.replace(/_/g, ' ').toUpperCase()}</Text>
        <Text style={styles.etaText}>ETA: {order.eta || 'Menghitung...'}</Text>
        {/* Dummy ETA for now, will come from backend in real app */}
        <Text style={styles.driverInfo}>Driver: {order.driverId ? 'Assigned Driver' : 'Menunggu Driver'}</Text>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', { orderId: order._id, receiverId: order.driverId })} // Pass driverId as receiverId
          disabled={!order.driverId}
        >
          <Text style={styles.chatButtonText}>Chat Driver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Theme.spacing.medium,
    fontSize: Theme.fontSizes.medium,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.medium,
    paddingTop: Platform.OS === 'ios' ? Theme.spacing.xlarge : Theme.spacing.medium,
    backgroundColor: Colors.primary,
    ...Theme.shadows.medium,
  },
  headerTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.cardBackground,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.medium,
    margin: Theme.spacing.medium,
    position: 'absolute',
    bottom: Theme.spacing.medium,
    left: 0,
    right: 0,
    ...Theme.shadows.medium,
  },
  statusText: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.small,
  },
  etaText: {
    fontSize: Theme.fontSizes.large,
    color: Colors.accent,
    marginBottom: Theme.spacing.small,
  },
  driverInfo: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.medium,
  },
  chatButton: {
    backgroundColor: Colors.secondary,
    padding: Theme.spacing.small,
    borderRadius: Theme.borderRadius.medium,
    alignItems: 'center',
  },
  chatButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
});
