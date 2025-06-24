import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

const TransactionItem = ({ transaction }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIconContainer}>
      <Ionicons
        name={transaction.type === 'withdrawal' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
        size={Theme.fontSizes.xlarge}
        color={transaction.type === 'withdrawal' ? Colors.error : Colors.accent}
      />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDescription}>{transaction.description || transaction.type.replace(/_/g, ' ').toUpperCase()}</Text>
      <Text style={styles.transactionDate}>{new Date(transaction.timestamp).toLocaleString('id-ID')}</Text>
    </View>
    <Text style={[styles.transactionAmount, { color: transaction.amount < 0 ? Colors.error : Colors.accent }]}>
      Rp {transaction.amount.toLocaleString('id-ID')}
    </Text>
  </View>
);

export default function WalletScreen({ navigation }) {
  const { userToken } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (userToken) {
      fetchWalletData();
    }
  }, [userToken]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/wallet`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      } else {
        Alert.alert('Error', data.message || 'Gagal memuat data dompet.');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Error', 'Koneksi server gagal saat memuat data dompet.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || !bankAccount || !bankName) {
      Alert.alert('Error', 'Harap isi semua kolom penarikan dengan benar.');
      return;
    }
    if (parseFloat(withdrawalAmount) > balance) {
      Alert.alert('Error', 'Saldo tidak mencukupi.');
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          bankAccount,
          bankName,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Permintaan penarikan berhasil diproses!');
        setBalance(data.currentBalance); // Update balance from response
        setWithdrawalAmount('');
        setBankAccount('');
        setBankName('');
        setShowWithdrawalForm(false);
        fetchWalletData(); // Re-fetch transactions to show new withdrawal
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat penarikan.');
      }
    } catch (error) {
      console.error('Error during withdrawal:', error);
      Alert.alert('Error', 'Koneksi server gagal saat penarikan.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dompet Saya</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.cardBackground} />
          ) : (
            <Text style={styles.balanceAmount}>Rp {balance.toLocaleString('id-ID')}</Text>
          )}
          <TouchableOpacity style={styles.withdrawButton} onPress={() => setShowWithdrawalForm(true)}>
            <Text style={styles.withdrawButtonText}>Tarik Dana</Text>
          </TouchableOpacity>
        </View>

        {showWithdrawalForm && (
          <View style={styles.withdrawalFormCard}>
            <Text style={styles.formTitle}>Form Penarikan Dana</Text>
            <TextInput
              style={styles.input}
              placeholder="Jumlah Penarikan (Rp)"
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nomor Rekening Bank"
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nama Bank (Contoh: BCA, Mandiri)"
              value={bankName}
              onChangeText={setBankName}
              autoCapitalize="words"
            />
            <TouchableOpacity style={styles.submitWithdrawalButton} onPress={handleWithdrawal} disabled={isWithdrawing}>
              {isWithdrawing ? (
                <ActivityIndicator color={Colors.cardBackground} />
              ) : (
                <Text style={styles.submitWithdrawalButtonText}>Proses Penarikan</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelWithdrawalButton} onPress={() => setShowWithdrawalForm(false)}>
              <Text style={styles.cancelWithdrawalButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
        ) : transactions.length === 0 ? (
          <Text style={styles.noTransactionsText}>Tidak ada riwayat transaksi.</Text>
        ) : (
          <FlatList
            data={transactions}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.transactionList}
            scrollEnabled={false} // Disable inner scroll if within a ScrollView
          />
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
    paddingTop: Theme.spacing.large * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.large,
  },
  headerTitle: {
    fontSize: Theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    padding: Theme.spacing.large,
    borderRadius: Theme.borderRadius.large,
    ...Theme.shadows.medium,
    alignItems: 'center',
    marginBottom: Theme.spacing.xlarge,
  },
  balanceLabel: {
    fontSize: Theme.fontSizes.medium,
    color: Colors.cardBackground,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: Theme.fontSizes.xxlarge,
    fontWeight: 'bold',
    color: Colors.cardBackground,
    marginVertical: Theme.spacing.xsmall,
  },
  withdrawButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Theme.spacing.small,
    paddingHorizontal: Theme.spacing.medium,
    borderRadius: Theme.borderRadius.pill,
    marginTop: Theme.spacing.medium,
  },
  withdrawButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.medium,
  },
  transactionList: {
    paddingVertical: Theme.spacing.small,
  },
  transactionItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.medium,
    marginBottom: Theme.spacing.small,
    ...Theme.shadows.small,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    marginRight: Theme.spacing.small,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  transactionDate: {
    fontSize: Theme.fontSizes.small,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: Theme.spacing.large,
  },
  noTransactionsText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Theme.spacing.medium,
    fontSize: Theme.fontSizes.medium,
  },
  // Withdrawal Form Styles
  withdrawalFormCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.medium,
    ...Theme.shadows.medium,
    marginBottom: Theme.spacing.xlarge,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  formTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.medium,
    textAlign: 'center',
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
  submitWithdrawalButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Theme.spacing.small,
    borderRadius: Theme.borderRadius.pill,
    alignItems: 'center',
    marginTop: Theme.spacing.small,
    marginBottom: Theme.spacing.small,
  },
  submitWithdrawalButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  cancelWithdrawalButton: {
    backgroundColor: Colors.error,
    paddingVertical: Theme.spacing.small,
    borderRadius: Theme.borderRadius.pill,
    alignItems: 'center',
  },
  cancelWithdrawalButtonText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
    fontWeight: 'bold',
  },
});
