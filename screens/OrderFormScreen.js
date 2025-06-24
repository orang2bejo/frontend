import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Untuk pilihan metode pembayaran
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { WebView } from 'react-native-webview';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

// PaymentScreen Component - untuk menampilkan WebView Midtrans
const PaymentScreen = ({ route }) => {
  const { uri } = route.params;
  return <WebView source={{ uri }} />; // Menampilkan URL pembayaran di WebView
};

export default function OrderFormScreen() {
  const { userToken } = useAuth();
  const navigation = useNavigation();
  const [itemDescription, setItemDescription] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerNotes, setCustomerNotes] = useState('');

  const handleSubmitOrder = async () => {
    if (!itemDescription || !deliveryAddress || !estimatedBudget || !paymentMethod) {
      Alert.alert('Error', 'Harap lengkapi semua bidang yang wajib diisi.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          itemDescription,
          deliveryAddress,
          estimatedBudget: parseFloat(estimatedBudget), // Pastikan ini angka
          paymentMethod,
          customerNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Pesanan berhasil dibuat!');

        // Inisialisasi pembayaran setelah order dibuat
        try {
          const paymentResponse = await fetch(`${API_BASE_URL}/orders/${data.order._id}/initiate-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok) {
            // Navigasi ke PaymentScreen dengan URL pembayaran dari Midtrans
            navigation.navigate('PaymentScreen', { uri: paymentData.redirect_url });

          } else {
            Alert.alert('Gagal memulai pembayaran', paymentData.message || 'Terjadi kesalahan saat memulai pembayaran.');
            navigation.navigate('OrdersCustomer'); // Navigasi kembali jika gagal memulai pembayaran
          }
        } catch (paymentError) {
          console.error('Error initiating payment:', paymentError);
          Alert.alert('Error', 'Tidak dapat terhubung ke server untuk memulai pembayaran.');
          navigation.navigate('OrdersCustomer');
        }

      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat membuat pesanan.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Buat Pesanan Baru</Text>
        <Text style={styles.subtitle}>Isi detail barang yang ingin Anda titipkan.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Deskripsi Barang*</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 2 Indomie Goreng, 1 Pepsi"
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Alamat Pengiriman*</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan alamat lengkap Anda"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />

          {/* Mock Upload Foto - diimplementasikan di fase selanjutnya */}
          <Text style={styles.label}>Upload Foto Barang (Opsional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => Alert.alert('Fitur', 'Fitur upload foto belum diimplementasikan.')}>
            <Text style={styles.uploadButtonText}>Pilih Foto</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Estimasi Budget (Rp)*</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 50000"
            value={estimatedBudget}
            onChangeText={setEstimatedBudget}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Metode Pembayaran*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue, itemIndex) => setPaymentMethod(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Cash on Delivery" value="cash" />
              <Picker.Item label="Transfer Bank" value="transfer" />
              <Picker.Item label="E-wallet" value="e-wallet" />
            </Picker>
          </View>

          <Text style={styles.label}>Catatan untuk Driver (Opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Tambahkan instruksi khusus"
            value={customerNotes}
            onChangeText={setCustomerNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitOrder}>
        <Text style={styles.submitButtonText}>Cari Driver</Text>
      </TouchableOpacity>
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
    paddingBottom: Theme.spacing.large * 3, // Agar tidak tertutup tombol submit
  },
  title: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.large,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.medium,
    ...Theme.shadows.small,
  },
  label: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.small,
    marginTop: Theme.spacing.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.small,
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
  },
  uploadButton: {
    backgroundColor: Colors.lightGray,
    padding: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.medium,
    alignItems: 'center',
    marginVertical: Theme.spacing.small,
  },
  uploadButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.medium,
    marginBottom: Theme.spacing.medium,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.secondary, // Cyan color
    padding: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    margin: Theme.spacing.medium,
    ...Theme.shadows.medium,
    position: 'absolute',
    bottom: Theme.spacing.medium,
    left: Theme.spacing.medium,
    right: Theme.spacing.medium,
  },
  submitButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
  },
});
