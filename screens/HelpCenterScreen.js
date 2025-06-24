import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';

const FAQ_DATA = [
  { question: 'Bagaimana cara membuat pesanan?', answer: 'Anda dapat membuat pesanan dari Dashboard Customer dengan menekan tombol 'Buat Order Baru'.' },
  { question: 'Bagaimana cara melacak pesanan saya?', answer: 'Setelah driver menerima pesanan, Anda dapat melihat lokasi driver secara real-time di halaman Tracking Pesanan.' },
  { question: 'Bagaimana jika harga barang berbeda dari estimasi?', answer: 'Driver akan menghubungi Anda melalui fitur chat untuk mengkonfirmasi harga aktual. Anda dapat menyetujui atau membatalkan pesanan.' },
  { question: 'Bagaimana cara menghubungi driver?', answer: 'Anda bisa menggunakan fitur chat real-time yang tersedia di detail pesanan aktif Anda.' },
  { question: 'Bagaimana cara mengubah profil?', answer: 'Anda bisa mengubah informasi profil Anda di halaman Akun.' },
];

export default function HelpCenterScreen({ navigation }) {
  const handleContactSupport = (method) => {
    if (method === 'chat') {
      Alert.alert('Dukungan Chat', 'Fitur chat dukungan akan diimplementasikan di sini.');
    } else if (method === 'email') {
      Linking.openURL('mailto:support@jastipdriver.com');
    } else if (method === 'phone') {
      Alert.alert('Telepon Dukungan', 'Silakan hubungi kami di: +6281234567890');
      // Linking.openURL('tel:+6281234567890');
    }
  };

  const handleSOS = () => {
    Alert.alert(
      'Peringatan Darurat',
      'Apakah Anda yakin ingin memanggil tim darurat? Ini hanya untuk situasi darurat serius.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Panggil Darurat', onPress: () => Alert.alert('Darurat!', 'Tim darurat telah dihubungi.') },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <View style={{ width: Theme.fontSizes.xlarge }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pertanyaan Umum (FAQ)</Text>
          {FAQ_DATA.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContactSupport('chat')}>
            <Ionicons name="chatbox-outline" size={Theme.fontSizes.large} color={Colors.primary} style={styles.contactIcon} />
            <Text style={styles.contactButtonText}>Chat dengan Dukungan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContactSupport('email')}>
            <Ionicons name="mail-outline" size={Theme.fontSizes.large} color={Colors.primary} style={styles.contactIcon} />
            <Text style={styles.contactButtonText}>Email Kami</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContactSupport('phone')}>
            <Ionicons name="call-outline" size={Theme.fontSizes.large} color={Colors.primary} style={styles.contactIcon} />
            <Text style={styles.contactButtonText}>Telepon Dukungan</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <Ionicons name="warning-outline" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
          <Text style={styles.sosButtonText}>SOS / Darurat</Text>
        </TouchableOpacity>
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
    paddingBottom: Theme.spacing.large * 2, // Extra padding for SOS button
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
  sectionTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: Theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: Theme.spacing.small,
  },
  faqQuestion: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.xsmall,
  },
  faqAnswer: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.textSecondary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.medium,
    marginBottom: Theme.spacing.small,
  },
  contactIcon: {
    marginRight: Theme.spacing.small,
  },
  contactButtonText: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sosButton: {
    backgroundColor: Colors.error, // Red for SOS
    padding: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.large,
    ...Theme.shadows.medium,
  },
  sosButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    marginTop: Theme.spacing.small,
  },
});
