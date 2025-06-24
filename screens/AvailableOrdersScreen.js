import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

const OrderCard = ({ order, onAccept }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderCardHeader}>
      <Text style={styles.orderCardTitle}>{order.itemDescription}</Text>
      <Text style={styles.orderCardStatus}>Menunggu Driver</Text>
    </View>
    <Text style={styles.orderCardDetail}>Antar ke: {order.deliveryAddress.substring(0, 40)}{order.deliveryAddress.length > 40 ? '...' : ''}</Text>
    <Text style={styles.orderCardDetail}>Estimasi Budget: Rp {order.estimatedBudget ? order.estimatedBudget.toLocaleString('id-ID') : '-'}</Text>
    <Text style={styles.orderCardDate}>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}</Text>
    <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(order._id)}>
      <Text style={styles.acceptButtonText}>Terima Order</Text>
      <Ionicons name="checkmark-circle-outline" size={Theme.fontSizes.medium} color={Colors.cardBackground} style={{ marginLeft: 5 }} />
    </TouchableOpacity>
  </View>
);

export default function AvailableOrdersScreen({ navigation }) {
  const { userToken, userId } = useAuth(); // Assume userId is available
  const { socket, isConnected } = useSocket();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userToken) {
      fetchAvailableOrders();
    }

    if (socket && isConnected) {
      // Listen for new orders if any are created while driver is online
      socket.on('new_order_available', (newOrder) => {
        console.log('New order available via socket:', newOrder);
        // Add to list only if it's pending assignment and not already in list
        if (newOrder.status === 'pending_driver_assignment' && !availableOrders.some(order => order._id === newOrder._id)) {
            setAvailableOrders(prevOrders => [newOrder, ...prevOrders]);
            Alert.alert('Notifikasi', 'Ada order baru yang tersedia!');
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order_available');
      }
    };
  }, [userToken, socket, isConnected, availableOrders]);

  const fetchAvailableOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/driver/available`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setAvailableOrders(data.availableOrders);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat pesanan tersedia.');
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat pesanan tersedia.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Order berhasil diterima!');
        // Remove from available orders and potentially add to active orders (navigate)
        setAvailableOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        navigation.navigate('HomeDriver'); // Navigate to Driver Dashboard to see active order
      } else {
        Alert.alert('Gagal', data.message || 'Gagal menerima order.');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Error', 'Koneksi server gagal saat menerima order.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesanan Tersedia</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
      ) : availableOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>Tidak ada pesanan tersedia saat ini.</Text>
      ) : (
        <FlatList
          data={availableOrders}
          renderItem={({ item }) => <OrderCard order={item} onAccept={handleAcceptOrder} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Theme.spacing.medium,
    paddingTop: Theme.spacing.large * 2,
  },
  title: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: Theme.spacing.small,
  },
  orderCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.medium,
    marginBottom: Theme.spacing.small,
    ...Theme.shadows.small,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.small,
  },
  orderCardTitle: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flexShrink: 1,
    marginRight: Theme.spacing.small,
  },
  orderCardStatus: {
    fontSize: Theme.fontSizes.small,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  orderCardDetail: {
    fontSize: Theme.fontSizes.small,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.xsmall,
  },
  orderCardDate: {
    fontSize: Theme.fontSizes.xsmall,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Theme.spacing.xsmall,
  },
  acceptButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.small,
    borderRadius: Theme.borderRadius.medium,
    marginTop: Theme.spacing.medium,
  },
  acceptButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: Theme.spacing.large,
  },
  noOrdersText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Theme.spacing.medium,
    fontSize: Theme.fontSizes.medium,
  },
});
