import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function RatingReviewScreen({ route, navigation }) {
  const { orderId, targetUserId } = route.params; // orderId and the ID of the user being rated (driver/customer)
  const { userToken } = useAuth(); // current user's token

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Harap berikan rating bintang minimal 1.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ rating, review }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Rating berhasil dikirim!');
        navigation.goBack(); // Kembali ke layar sebelumnya
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat mengirim rating.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beri Rating & Review</Text>
        <View style={{ width: Theme.fontSizes.xlarge }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Bagaimana pengalaman Anda dengan order ini?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={Theme.fontSizes.xxlarge}
                  color={star <= rating ? Colors.warning : Colors.lightGray} // Yellow for active stars
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tulis ulasan Anda (Opsional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Contoh: Driver sangat ramah dan pengiriman cepat!"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Quick Feedback Chips - Optional for future development */}
        {/* <View style={styles.card}> 
          <Text style={styles.label}>Feedback Cepat</Text>
          <View style={styles.chipsContainer}>
             {['Ramah', 'Cepat', 'Barang Sesuai', 'Komunikasi Baik'].map((chip, index) => (
                <TouchableOpacity key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
             ))}
          </View>
        </View> */}

      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitRating} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={Colors.cardBackground} />
        ) : (
          <Text style={styles.submitButtonText}>Kirim Rating</Text>
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
    paddingBottom: Theme.spacing.large * 4,
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
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Theme.spacing.medium,
  },
  starIcon: {
    marginHorizontal: Theme.spacing.xsmall,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.small,
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.accent,
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
