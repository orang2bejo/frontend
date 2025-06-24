import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function DriverDashboardScreen({ navigation }) {
  const { userToken, userId } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false); // For future: connect to backend status

  useEffect(() => {
    if (userToken && userId) {
      fetchDriverData();
    }
  }, [userToken, userId]);

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      // This assumes an endpoint like /api/users/me exists or combines with wallet endpoint
      // For MVP, we'll use the wallet endpoint as it gives balance and total orders completed is on User schema
      const response = await fetch(`${API_BASE_URL}/users/me/wallet`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        // Fetch user details separately if wallet doesn't return totalOrdersCompleted
        const userResponse = await fetch(`${API_BASE_URL}/users/me`, { // Assuming /users/me exists or adjust API
          headers: { 'Authorization': `Bearer ${userToken}` },
        });
        const userData = await userResponse.json();

        if (userResponse.ok) {
          setDriverData({
            balance: data.balance,
            totalOrdersCompleted: userData.totalOrdersCompleted || 0,
            // Add other driver specific data as needed
          });
        } else {
          Alert.alert('Error', userData.message || 'Gagal memuat detail driver.');
        }

      } else {
        Alert.alert('Error', data.message || 'Gagal memuat data dompet driver.');
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat data driver.');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle online/offline status (for future backend integration)
  const toggleOnlineStatus = () => {
    setIsOnline(previousState => !previousState);
    // TODO: Send API request to backend to update driver's online status
    // Example: fetch(`${API_BASE_URL}/drivers/status`, { method: 'PUT', body: JSON.stringify({ isOnline: !isOnline }) })
    Alert.alert('Status', `Anda sekarang ${!isOnline ? 'Online' : 'Offline'}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data driver...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Halo, Driver!</Text>
          <View style={styles.statusToggleContainer}>
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              trackColor={{ false: Colors.darkGray, true: Colors.accent }}
              thumbColor={isOnline ? Colors.cardBackground : Colors.cardBackground}
              ios_backgroundColor={Colors.darkGray}
              onValueChange={toggleOnlineStatus}
              value={isOnline}
            />
            <TouchableOpacity onPress={() => Alert.alert('Notifikasi', 'Fitur notifikasi belum diimplementasikan')}> 
              <Ionicons name="notifications-outline" size={Theme.fontSizes.xlarge} color={Colors.textPrimary} style={{ marginLeft: Theme.spacing.small }}/>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.walletCard} onPress={() => navigation.navigate('WalletDriver')}>
          <Text style={styles.walletCardLabel}>Pendapatan Hari Ini</Text>
          <Text style={styles.walletCardAmount}>Rp {driverData.balance ? driverData.balance.toLocaleString('id-ID') : '0'}</Text>
          <Text style={styles.walletCardOrders}>{driverData.totalOrdersCompleted} Order Selesai</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AvailableOrdersDriver')}>
            <Ionicons name="layers-outline" size={Theme.fontSizes.xlarge} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Order Tersedia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ActiveOrdersList')}>
            <Ionicons name="clipboard-outline" size={Theme.fontSizes.xlarge} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Order Aktif</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('WalletDriver')}>
            <Ionicons name="wallet-outline" size={Theme.fontSizes.xlarge} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Dompet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Fitur', 'Fitur Bantuan belum diimplementasikan')}> 
            <Ionicons name="help-circle-outline" size={Theme.fontSizes.xlarge} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Bantuan</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.medium,
    paddingVertical: Theme.spacing.large,
    backgroundColor: Colors.cardBackground,
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
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: Theme.fontSizes.medium,
    marginRight: Theme.spacing.small,
    color: Colors.textPrimary,
  },
  walletCard: {
    backgroundColor: Colors.primary,
    padding: Theme.spacing.large,
    borderRadius: Theme.borderRadius.large,
    ...Theme.shadows.medium,
    marginBottom: Theme.spacing.xlarge,
  },
  walletCardLabel: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.cardBackground,
    opacity: 0.8,
  },
  walletCardAmount: {
    fontSize: Theme.fontSizes.xxlarge,
    fontWeight: 'bold',
    color: Colors.cardBackground,
    marginVertical: Theme.spacing.xsmall,
  },
  walletCardOrders: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.cardBackground,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Theme.spacing.medium,
    marginBottom: Theme.spacing.medium,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Approximately half width for two columns
    marginBottom: Theme.spacing.medium,
    ...Theme.shadows.small,
  },
  actionButtonText: {
    fontSize: Theme.fontSizes.small,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Theme.spacing.small,
    textAlign: 'center',
  },
});
