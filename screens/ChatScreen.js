import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatScreen({ route, navigation }) {
  const { orderId, receiverId, initialMessages = [] } = route.params; // Pass orderId and receiverId, and optionally initial messages
  const { userToken, userRole, userId } = useAuth(); // Assume userId is available from useAuth
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (!isConnected || !socket) {
      console.warn('Socket not connected or not available.');
      // Potentially show a warning or retry connection
      return;
    }

    // Join the specific order chat room
    console.log(`Joining chat room: ${orderId}`);
    socket.emit('join_chat', orderId);

    // Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      console.log('Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('receive_message', handleReceiveMessage);

    // Clean up on unmount
    return () => {
      console.log(`Leaving chat room: ${orderId}`);
      socket.off('receive_message', handleReceiveMessage);
      // Note: socket.leave is usually handled by server on disconnect or client explicitly leaves.
    };
  }, [socket, isConnected, orderId]);

  const sendMessage = useCallback(() => {
    if (currentMessage.trim() && socket && isConnected) {
      const messageData = {
        orderId,
        senderId: userId, // Current authenticated user's ID
        receiverId,      // The ID of the person they are chatting with
        message: currentMessage.trim(),
        // imageUrl: '' // For future image sending
      };
      socket.emit('send_message', messageData);
      setCurrentMessage('');
      // Optimistically add message to UI (or wait for server echo/DB fetch)
      // setMessages((prevMessages) => [...prevMessages, { ...messageData, timestamp: new Date().toISOString(), _id: Math.random().toString() }]);
    } else if (!isConnected) {
      Alert.alert('Error', 'Tidak terhubung ke chat. Pastikan koneksi internet Anda stabil.');
    }
  }, [currentMessage, socket, isConnected, orderId, userId, receiverId]);

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === userId; // Check if current user is the sender
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Pesanan {orderId.substring(0, 4)}...</Text>
        {/* Placeholder for receiver's name/avatar */}
        <View style={{ width: Theme.fontSizes.xlarge }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()} // Use _id from DB or index as fallback
        contentContainerStyle={styles.messageList}
        inverted={false} // Display newest messages at the bottom
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ketik pesan..."
          value={currentMessage}
          onChangeText={setCurrentMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={Theme.fontSizes.xlarge} color={Colors.cardBackground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.medium,
    paddingTop: Platform.OS === 'ios' ? Theme.spacing.xlarge : Theme.spacing.medium, // Adjust for iOS notch
    backgroundColor: Colors.primary,
    ...Theme.shadows.medium,
  },
  headerTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.cardBackground,
  },
  messageList: {
    paddingHorizontal: Theme.spacing.small,
    paddingVertical: Theme.spacing.medium,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Theme.spacing.small,
    borderRadius: Theme.borderRadius.medium,
    marginBottom: Theme.spacing.small,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary, // Cyan for my messages
    borderBottomRightRadius: Theme.borderRadius.small, // Tail effect
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightGray,
    borderBottomLeftRadius: Theme.borderRadius.small, // Tail effect
  },
  myMessageText: {
    color: Colors.cardBackground,
    fontSize: Theme.fontSizes.medium,
  },
  otherMessageText: {
    color: Colors.textPrimary,
    fontSize: Theme.fontSizes.medium,
  },
  timestamp: {
    fontSize: Theme.fontSizes.xsmall,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: Theme.spacing.xsmall / 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.small,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderColor: Colors.lightGray,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.medium,
    paddingVertical: Theme.spacing.small,
    marginRight: Theme.spacing.small,
    fontSize: Theme.fontSizes.medium,
    maxHeight: 100, // Prevent input from growing too large
  },
  sendButton: {
    backgroundColor: Colors.secondary,
    borderRadius: Theme.borderRadius.pill,
    padding: Theme.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
