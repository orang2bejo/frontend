import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import DriverDashboardScreen from '../screens/DriverDashboardScreen';
import OrderFormScreen from '../screens/OrderFormScreen';
import CustomerOrdersScreen from '../screens/CustomerOrdersScreen';
import AvailableOrdersScreen from '../screens/AvailableOrdersScreen';
import WalletScreen from '../screens/WalletScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen'; // Import HelpCenterScreen

import CustomerHomeStack from './CustomerHomeStack';
import DriverHomeStack from './DriverHomeStack';

const Tab = createBottomTabNavigator();

// --- Customer Tabs ---
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00FFFF', // Cyan
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTabCustomer') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OrdersCustomer') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'NotificationsCustomer') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'AccountCustomer') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTabCustomer"
        component={CustomerHomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="OrdersCustomer"
        component={CustomerOrdersScreen}
        options={{ title: 'Pesanan' }}
      />
      <Tab.Screen
        name="NotificationsCustomer"
        component={CustomerDashboardScreen} // Placeholder
        options={{ title: 'Notifikasi' }}
      />
      <Tab.Screen
        name="AccountCustomer"
        component={HelpCenterScreen} // Use HelpCenterScreen here
        options={{ title: 'Akun' }}
      />
    </Tab.Navigator>
  );
}

// --- Driver Tabs ---
function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00FFFF', // Cyan
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTabDriver') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'AvailableOrdersDriver') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'WalletDriver') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'AccountDriver') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTabDriver"
        component={DriverHomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="AvailableOrdersDriver"
        component={AvailableOrdersScreen}
        options={{ title: 'Order Tersedia' }}
      />
      <Tab.Screen
        name="WalletDriver"
        component={WalletScreen}
        options={{ title: 'Dompet' }}
      />
      <Tab.Screen
        name="AccountDriver"
        component={HelpCenterScreen} // Use HelpCenterScreen here
        options={{ title: 'Akun' }}
      />
    </Tab.Navigator>
  );
}

export { CustomerTabs, DriverTabs };
