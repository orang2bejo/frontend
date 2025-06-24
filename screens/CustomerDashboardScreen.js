import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function CustomerDashboardScreen({ navigation }) {
  const { userToken } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    if (userToken) {
      fetchActiveOrders();
      fetchPastOrders();
    }
  }, [userToken]);

  const fetchActiveOrders = async () => {
    setLoadingActive(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/customer?status=active_statuses`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Filter more precisely for active statuses if backend doesn't handle it fully
        const active = data.orders.filter(order => 
          ['driver_found', 'driver_on_the_way_to_store', 'driver_at_store', 'item_purchased', 'on_the_way_to_customer', 'delivered']
          .includes(order.status)
        );
        setActiveOrders(active);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat pesanan aktif.');
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat pesanan aktif.');
    } finally {
      setLoadingActive(false);
    }
  };

  const fetchPastOrders = async () => {
    setLoadingPast(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/customer?status=completed`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPastOrders(data.orders);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat riwayat pesanan.');
      }
    } catch (error) {
      console.error('Error fetching past orders:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat riwayat pesanan.');
    } finally {
      setLoadingPast(false);
    }
  };

  const navigateToOrderForm = () => {
    navigation.navigate('OrderForm');
  };

  // A simple Order Card component for rendering lists
  const OrderCard = ({ order, onPress }) => (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderCardTitle}>{order.itemDescription}</Text>
        <Text style={[styles.orderCardStatus, { color: order.status === 'completed' ? Colors.accent : Colors.secondary }]}>
          {order.status.replace(/_/g, ' ').toUpperCase()}
        </Text>
      </View>
      <Text style={styles.orderCardDetail}>Alamat: {order.deliveryAddress.substring(0, 30)}...</Text>
      {order.actualPrice && (
        <Text style={styles.orderCardDetail}>Harga: Rp {order.actualPrice.toLocaleString('id-ID')}</Text>
      )}
      {order.estimatedBudget && !order.actualPrice && (
        <Text style={styles.orderCardDetail}>Estimasi: Rp {order.estimatedBudget.toLocaleString('id-ID')}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Halo, {userToken ? 'Customer' : 'Pengguna'}!</Text>
          <TouchableOpacity onPress={() => Alert.alert('Notifikasi', 'Fitur notifikasi belum diimplementasikan')}> 
            <Ionicons name="notifications-outline" size={Theme.fontSizes.xlarge} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createOrderCard} onPress={navigateToOrderForm}>
          <Text style={styles.createOrderText}>Mau nitip apa hari ini?</Text>
          <Ionicons name="add-circle-outline" size={Theme.fontSizes.xxlarge} color={Colors.cardBackground} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
        {loadingActive ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
        ) : activeOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>Tidak ada pesanan aktif saat ini.</Text>
        ) : (
          activeOrders.map(order => <OrderCard key={order._id} order={order} onPress={() => navigation.navigate('Tracking', { orderId: order._id })} />)
        )}

        <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
        {loadingPast ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
        ) : pastOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>Tidak ada riwayat pesanan.</Text>
        ) : (
          pastOrders.map(order => <OrderCard key={order._id} order={order} onPress={() => Alert.alert('Detail', `Lihat detail order: ${order.itemDescription}`)} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.medium,
    paddingVertical: Theme.spacing.large,
    backgroundColor: Colors.cardBackground, // Use a solid background for header area
    borderBottomLeftRadius: Theme.borderRadius.large,
    borderBottomRightRadius: Theme.borderRadius.large,
    ...Theme.shadows.small,
    marginBottom: Theme.spacing.medium,
  },
  headerText: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  createOrderCard: {
    backgroundColor: Colors.primary, // Navy color for primary action
    padding: Theme.spacing.large,
    borderRadius: Theme.borderRadius.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Theme.shadows.medium,
    marginBottom: Theme.spacing.xlarge,
  },
  createOrderText: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.cardBackground,
  },
  sectionTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Theme.spacing.medium,
    marginBottom: Theme.spacing.medium,
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
  loadingIndicator: {
    marginVertical: Theme.spacing.large,
  },
  noOrdersText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Theme.spacing.medium,
  },
});
