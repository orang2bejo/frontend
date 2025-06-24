import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu (misal: http://192.168.1.xxx:5000)

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setMessage(''); // Clear previous messages
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Login Berhasil!', `Selamat datang, ${data.role}! Token: ${data.token.substring(0, 20)}...`);
        setMessage(`Login Berhasil! Role: ${data.role}`);
        // Di sini Anda akan menyimpan token (misal: AsyncStorage) dan navigasi ke dashboard
      } else {
        Alert.alert('Login Gagal', data.message || 'Terjadi kesalahan saat login.');
        setMessage(`Login Gagal: ${data.message || 'Terjadi kesalahan.'}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server. Pastikan backend berjalan dan koneksi internet stabil.');
      setMessage('Koneksi server gagal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jastip Driver</Text>
      <Text style={styles.subtitle}>Login</Text>
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
      <Button title="Login" onPress={handleLogin} color="#00FFFF" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    color: '#000080', // Navy color
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
  message: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
