import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('customer'); // Default role for registration

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { fullName, email, phoneNumber, password, role };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(isLogin ? 'Login Berhasil!' : 'Registrasi Berhasil!', `Selamat datang, ${data.role}!`);
        // TODO: Simpan token (data.token) menggunakan AsyncStorage atau Context API
        // navigation.navigate('MainTabs'); // Arahkan ke dashboard utama setelah login/register
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan.');
      }
    } catch (error) {
      console.error('Error during auth:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jastip Driver</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Login' : 'Daftar'}</Text>

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Nomor Telepon (+62...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
              onPress={() => setRole('driver')}
            >
              <Text style={[styles.roleButtonText, role === 'driver' && styles.roleButtonTextActive]}>Driver</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLogin ? 'Login' : 'Daftar'} onPress={handleAuth} color="#00FFFF" />

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {isLogin ? 'Belum punya akun? Daftar sekarang!' : 'Sudah punya akun? Login di sini!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000080',
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'space-around',
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  roleButtonActive: {
    backgroundColor: '#00FFFF',
  },
  roleButtonText: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  toggleButton: {
    marginTop: 20,
  },
  toggleButtonText: {
    color: '#000080',
    textDecorationLine: 'underline',
  },
});
