import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function UploadProofScreen({ route, navigation }) {
  const { orderId } = route.params; // Get orderId from navigation params
  const { userToken } = useAuth();
  
  const [actualPrice, setActualPrice] = useState('');
  const [purchaseReceiptImage, setPurchaseReceiptImage] = useState(null);
  const [purchasedItemImage, setPurchasedItemImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin galeri untuk ini!');
        }
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Izin Diperlukan', 'Maaf, kami memerlukan izin kamera untuk ini!');
        }
      }
    })();
  }, []);

  const pickImage = async (setImageFunc) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageFunc(result.assets[0].uri);
    }
  };

  const takePhoto = async (setImageFunc) => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageFunc(result.assets[0].uri);
    }
  };

  const uploadImageToCloud = async (uri) => {
    // In a real app, you would upload this image to a cloud storage like Firebase Storage, AWS S3, or Cloudinary
    // For this MVP, we'll just mock a URL. Backend expects a URL.
    return new Promise(resolve => {
      console.log('Mocking image upload for URI:', uri);
      setTimeout(() => {
        // Generate a dummy URL
        const dummyUrl = `https://dummyimage.com/300x200/000/fff&text=IMG-${Math.random().toString(36).substring(7)}.png`;
        resolve(dummyUrl);
      }, 1000);
    });
  };

  const handleSubmitProof = async () => {
    if (!actualPrice || !purchaseReceiptImage || !purchasedItemImage) {
      Alert.alert('Error', 'Harap lengkapi semua bidang: Harga aktual, foto struk, dan foto barang.');
      return;
    }

    setLoading(true);
    try {
      // Mock upload images to get URLs
      const receiptUrl = await uploadImageToCloud(purchaseReceiptImage);
      const itemUrl = await uploadImageToCloud(purchasedItemImage);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/purchase-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          actualPrice: parseFloat(actualPrice),
          purchaseReceiptUrl: receiptUrl,
          purchasedItemImageUrl: itemUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Bukti pembelian berhasil diunggah!');
        navigation.goBack(); // Kembali ke layar sebelumnya (ActiveOrdersList)
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat mengunggah bukti pembelian.');
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server atau upload gambar gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Bukti Pembelian</Text>
          <View style={{ width: Theme.fontSizes.xlarge }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total Biaya Belanja (Rp)*</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan harga aktual yang dibayar"
            value={actualPrice}
            onChangeText={setActualPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Foto Struk Belanja*</Text>
          {purchaseReceiptImage && <Image source={{ uri: purchaseReceiptImage }} style={styles.imagePreview} />}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setPurchaseReceiptImage)}>
              <Text style={styles.imageButtonText}>Pilih dari Galeri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={() => takePhoto(setPurchaseReceiptImage)}>
              <Text style={styles.imageButtonText}>Ambil Foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Foto Barang yang Sudah Dibeli*</Text>
          {purchasedItemImage && <Image source={{ uri: purchasedItemImage }} style={styles.imagePreview} />}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setPurchasedItemImage)}>
              <Text style={styles.imageButtonText}>Pilih dari Galeri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={() => takePhoto(setPurchasedItemImage)}>
              <Text style={styles.imageButtonText}>Ambil Foto</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitProof} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.cardBackground} />
        ) : (
          <Text style={styles.submitButtonText}>Konfirmasi & Unggah</Text>
        )}
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
    paddingBottom: Theme.spacing.large * 4, // More padding for submit button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.medium,
    paddingTop: Platform.OS === 'ios' ? Theme.spacing.xlarge : Theme.spacing.medium,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Theme.borderRadius.large,
    borderBottomRightRadius: Theme.borderRadius.large,
    ...Theme.shadows.medium,
    marginBottom: Theme.spacing.medium,
  },
  headerTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.cardBackground,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.medium,
    ...Theme.shadows.small,
    marginBottom: Theme.spacing.medium,
  },
  label: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.small,
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.medium,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.medium,
    marginBottom: Theme.spacing.medium,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Theme.spacing.small,
    paddingHorizontal: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.pill,
    flex: 1,
    marginHorizontal: Theme.spacing.xsmall,
    alignItems: 'center',
  },
  imageButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.small,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: Colors.accent, // Green for submission
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
