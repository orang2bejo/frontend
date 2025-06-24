import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan IP lokal Anda jika perlu

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      let token = null;
      let role = null;
      try {
        token = await AsyncStorage.getItem('userToken');
        role = await AsyncStorage.getItem('userRole');
      } catch (e) {
        console.error('Failed to load auth from storage', e);
      }
      setUserToken(token);
      setUserRole(role);
      setIsLoading(false);
    };
    loadStoredAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Check if token and role are present in the response
        if (data.token && data.role) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userRole', data.role);
          setUserToken(data.token);
          setUserRole(data.role);
          return { success: true, role: data.role };
        } else {
          console.warn('Token or role missing in login response');
          return { success: false, message: 'Invalid credentials received' };
        }
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error or server unavailable' };
    }
  };

  const register = async (fullName, email, phoneNumber, password, role, ktpNumber, ktpImageUrl) => {
    try {
      const body = { fullName, email, phoneNumber, password, role };
      if (role === 'driver') {
        Object.assign(body, { ktpNumber, ktpImageUrl });
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
           // Check if token and role are present in the response
          if (data.token && data.role) {
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userRole', data.role);
            setUserToken(data.token);
            setUserRole(data.role);
            return { success: true, role: data.role };
          } else {
            console.warn('Token or role missing in register response');
            return { success: false, message: 'Invalid data received from server' };
          }
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error or server unavailable' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      setUserToken(null);
      setUserRole(null);
    } catch (e) {
      console.error('Failed to clear auth from storage', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
