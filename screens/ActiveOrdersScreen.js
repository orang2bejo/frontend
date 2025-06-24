import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

const OrderCard = ({ order, onPress, onUpdateStatus, onCompleteOrder, onUploadProof }) => (
  <TouchableOpacity style={styles.orderCard} onPress={onPress}>
    <View style={styles.orderCardHeader}>
      <Text style={styles.orderCardTitle}>Order #{order._id.substring(0, 6)}</Text>
      <Text style={[styles.orderCardStatus, { color: order.status === 'item_purchased' || order.status === 'on_the_way_to_customer' ? Colors.accent : Colors.secondary }]}>
        {order.status.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
    <Text style={styles.orderCardDetail}>Barang: {order.itemDescription.substring(0, 50)}{order.itemDescription.length > 50 ? '...' : ''}</Text>
    <Text style={styles.orderCardDetail}>Antar ke: {order.deliveryAddress.substring(0, 40)}{order.deliveryAddress.length > 40 ? '...' : ''}</Text>
    {order.actualPrice && (
      <Text style={styles.orderCardDetail}>Harga Aktual: Rp {order.actualPrice.toLocaleString('id-ID')}</Text>
    )}
    <Text style={styles.orderCardDate}>Diterima: {new Date(order.updatedAt).toLocaleDateString('id-ID')}</Text>

    <View style={styles.actionButtons}>
      {order.status === 'driver_found' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onUpdateStatus(order._id, 'driver_on_the_way_to_store', 'Menuju Toko')}>
          <Text style={styles.actionButtonText}>Menuju Toko</Text>
        </TouchableOpacity>
      )}
      {order.status === 'driver_on_the_way_to_store' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onUpdateStatus(order._id, 'driver_at_store', 'Tiba di Toko')}>
          <Text style={styles.actionButtonText}>Tiba di Toko</Text>
        </TouchableOpacity>
      )}
      {order.status === 'driver_at_store' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onUploadProof(order._id)}>
          <Text style={styles.actionButtonText}>Upload Bukti Beli</Text>
        </TouchableOpacity>
      )}
      {order.status === 'item_purchased' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onUpdateStatus(order._id, 'on_the_way_to_customer', 'Menuju Pelanggan')}>
          <Text style={styles.actionButtonText}>Antar ke Pelanggan</Text>
        </TouchableOpacity>
      )}
      {order.status === 'on_the_way_to_customer' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onCompleteOrder(order._id)}>
          <Text style={styles.actionButtonText}>Selesaikan Order</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={() => Alert.alert('Chat', 'Akan navigasi ke chat dengan pelanggan')}>
          <Text style={styles.actionButtonText}>Chat Pelanggan</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function ActiveOrdersScreen({ navigation }) {
  const { userToken } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userToken) {
      fetchActiveOrders();
    }
  }, [userToken]);

  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/driver/active`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setActiveOrders(data.activeOrders);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat pesanan aktif.');
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat pesanan aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, statusMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', `Status order berhasil diubah menjadi: ${statusMessage}`);
        fetchActiveOrders(); // Refresh list
      } else {
        Alert.alert('Gagal', data.message || 'Gagal mengubah status order.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Koneksi server gagal saat mengubah status.');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Order berhasil diselesaikan!');
        fetchActiveOrders(); // Refresh list
      } else {
        Alert.alert('Gagal', data.message || 'Gagal menyelesaikan order.');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Error', 'Koneksi server gagal saat menyelesaikan order.');
    }
  };

  const handleUploadProof = (orderId) => {
    navigation.navigate('UploadProof', { orderId }); // Navigate to upload screen
  };

  const renderOrder = ({ item }) => (
    <OrderCard
      order={item}
      onPress={() => Alert.alert('Detail', `Lihat detail order: ${item.itemDescription}`)}
      onUpdateStatus={handleUpdateStatus}
      onCompleteOrder={handleCompleteOrder}
      onUploadProof={handleUploadProof}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesanan Aktif Anda</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
      ) : activeOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>Tidak ada pesanan aktif saat ini.</Text>
      ) : (
        <FlatList
          data={activeOrders}
          renderItem={renderOrder}
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
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.medium,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.small,
    paddingHorizontal: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.pill,
    marginHorizontal: Theme.spacing.xsmall,
    marginBottom: Theme.spacing.small,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: Colors.secondary, // Cyan for chat button
  },
  actionButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.small,
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
