import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

const OrderCard = ({ order, onPress }) => (
  <TouchableOpacity style={styles.orderCard} onPress={onPress}>
    <View style={styles.orderCardHeader}>
      <Text style={styles.orderCardTitle}>{order.itemDescription}</Text>
      <Text style={[styles.orderCardStatus, { color: order.status === 'completed' ? Colors.accent : Colors.secondary }]}>
        {order.status.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
    <Text style={styles.orderCardDetail}>Alamat: {order.deliveryAddress.substring(0, 30)}{order.deliveryAddress.length > 30 ? '...' : ''}</Text>
    {order.actualPrice && (
      <Text style={styles.orderCardDetail}>Harga: Rp {order.actualPrice.toLocaleString('id-ID')}</Text>
    )}
    {order.estimatedBudget && !order.actualPrice && (
      <Text style={styles.orderCardDetail}>Estimasi: Rp {order.estimatedBudget.toLocaleString('id-ID')}</Text>
    )}
    <Text style={styles.orderCardDate}>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}</Text>
  </TouchableOpacity>
);

export default function CustomerOrdersScreen({ navigation }) {
  const { userToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed', 'cancelled'

  useEffect(() => {
    if (userToken) {
      fetchOrders();
    }
  }, [userToken, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/orders/customer`;
      if (filterStatus === 'active') {
        url += `?status=driver_found,driver_on_the_way_to_store,driver_at_store,item_purchased,on_the_way_to_customer,delivered`;
      } else if (filterStatus === 'completed') {
        url += `?status=completed`;
      } else if (filterStatus === 'cancelled') {
        url += `?status=cancelled`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat pesanan.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => (
    <OrderCard order={item} onPress={() => {
      // Navigate to tracking if active, or detail screen if completed/cancelled
      if (['driver_found', 'driver_on_the_way_to_store', 'driver_at_store', 'item_purchased', 'on_the_way_to_customer'].includes(item.status)) {
        navigation.navigate('Tracking', { orderId: item._id, order: item });
      } else {
        Alert.alert('Detail Pesanan', `Detail untuk order: ${item.itemDescription}`);
        // In a full app, navigate to a detailed order screen
      }
    }} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Pesanan Saya</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'active' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'active' && styles.filterButtonTextActive]}>Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'completed' && styles.filterButtonTextActive]}>Selesai</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'cancelled' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('cancelled')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'cancelled' && styles.filterButtonTextActive]}>Dibatalkan</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>Tidak ada pesanan untuk status ini.</Text>
      ) : (
        <FlatList
          data={orders}
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
    paddingTop: Theme.spacing.large * 2, // Adjust for status bar
  },
  title: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.xsmall,
    marginBottom: Theme.spacing.medium,
    ...Theme.shadows.small,
  },
  filterButton: {
    paddingVertical: Theme.spacing.small,
    paddingHorizontal: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.pill,
  },
  filterButtonActive: {
    backgroundColor: Colors.secondary,
  },
  filterButtonText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: Theme.fontSizes.small,
  },
  filterButtonTextActive: {
    color: Colors.cardBackground,
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
