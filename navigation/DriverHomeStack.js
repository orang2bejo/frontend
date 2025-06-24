import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DriverDashboardScreen from '../screens/DriverDashboardScreen';
import ActiveOrdersScreen from '../screens/ActiveOrdersScreen'; // Import ActiveOrdersScreen
import UploadProofScreen from '../screens/UploadProofScreen'; // Will be created next
import ChatScreen from '../screens/ChatScreen'; // For driver initiating chat from active order

const Stack = createNativeStackNavigator();

export default function DriverHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      <Stack.Screen name="ActiveOrdersList" component={ActiveOrdersScreen} /> {/* ActiveOrdersScreen added */}
      <Stack.Screen name="UploadProof" component={UploadProofScreen} /> {/* Placeholder for next step */}
      <Stack.Screen name="ChatDriver" component={ChatScreen} /> {/* Driver side chat, passing customerId */}
    </Stack.Navigator>
  );
}
