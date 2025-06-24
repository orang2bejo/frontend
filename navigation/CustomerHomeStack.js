import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import OrderFormScreen from '../screens/OrderFormScreen';
import ChatScreen from '../screens/ChatScreen';
import TrackingScreen from '../screens/TrackingScreen';
import RatingReviewScreen from '../screens/RatingReviewScreen'; // Import RatingReviewScreen

const Stack = createNativeStackNavigator();

export default function CustomerHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="RatingReview" component={RatingReviewScreen} /> {/* Add RatingReviewScreen to the stack */}
    </Stack.Navigator>
  );
}
