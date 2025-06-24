import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './components/GlobalNotificationModal'; // Import NotificationProvider
import AuthStack from './navigation/AuthStack';
import { CustomerTabs, DriverTabs } from './navigation/MainTabs';

const RootStack = createNativeStackNavigator();

function AppContent() {
  const { userToken, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        userRole === 'customer' ? (
          <RootStack.Screen name="CustomerMain" component={CustomerTabs} />
        ) : (
          <RootStack.Screen name="DriverMain" component={DriverTabs} />
        )
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider> {/* Wrap NavigationContainer/AppContent with NotificationProvider */}
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
