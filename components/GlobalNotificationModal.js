import React, { useState, useEffect, createContext, useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null); // { type: 'info', title: '', message: '', actions: [] }
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const { userToken } = useAuth(); // Needed for API calls from actions

  useEffect(() => {
    if (isConnected && socket) {
      // Listen for order status updates that require customer confirmation/notification
      socket.on('order_status_update', (data) => {
        if (data && data.newStatus) { // Ensure data and newStatus exist
          // Example: Driver confirmed different price
          if (data.newStatus === 'price_change_awaiting_customer_confirmation') { // Assuming a new status for this
            if (data.orderId && data.actualPrice) { // Ensure orderId and actualPrice exist
              showModal({
                type: 'confirmation',
                title: 'Konfirmasi Harga Pesanan',
                message: `Driver menemukan harga berbeda untuk pesanan Anda #${data.orderId.substring(0, 6)}. Harga baru: Rp ${data.actualPrice.toLocaleString('id-ID')}. Setuju?`,
                actions: [
                  { text: 'Batalkan Pesanan', type: 'cancel', onPress: () => handleOrderAction(data.orderId, 'cancel', userToken) },
                  { text: 'Setuju', type: 'confirm', onPress: () => handleOrderAction(data.orderId, 'confirm_price', userToken) }, // New API for price confirmation
                ],
              });
            } else {
              console.warn('Missing orderId or actualPrice in price_change_awaiting_customer_confirmation event');
            }
          } else if (data.newStatus === 'driver_found') {
            if (data.orderId){ // Check if orderId exists
              showModal({
                type: 'info',
                title: 'Driver Ditemukan!',
                message: `Pesanan Anda #${data.orderId.substring(0, 6)} telah diterima oleh driver.`, 
              });
            } else {
              console.warn('Missing orderId in driver_found event');
            }
          }
        } else {
          console.warn('Missing data or newStatus in order_status_update event');
        }
        // Add other relevant notifications
      });

      // Listen for any general notifications (e.g., system wide messages)
      socket.on('general_notification', (data) => {
        showModal({ type: 'info', title: data.title, message: data.message });
      });
    }

    return () => {
      if (socket) {
        socket.off('order_status_update');
        socket.off('general_notification');
      }
    };
  }, [isConnected, socket, userToken]);

  const showModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalContent(null);
    setIsLoading(false);
  };

  const handleOrderAction = async (orderId, actionType, token) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      if (actionType === 'cancel') {
        endpoint = `/orders/${orderId}/cancel`;
        body = { reason: 'Customer rejected price change' };
      } else if (actionType === 'confirm_price') {
        // Assuming a new API endpoint for confirming price or general order update
        endpoint = `/orders/${orderId}/confirm-price`; // This endpoint needs to be created in backend
        body = { status: 'confirmed_price' }; // Example body
        method = 'PUT';
      }

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5000/api'}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', data.message || 'Aksi berhasil!');
        hideModal();
      } else {
        Alert.alert('Gagal', data.message || 'Aksi gagal.');
      }
    } catch (error) {
      console.error('Error during order action:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotificationContext.Provider value={{ showModal, hideModal }}>
      {children}
      
      {modalContent && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={hideModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Ionicons 
                  name={modalContent.type === 'confirmation' ? 'help-circle-outline' : 'information-circle-outline'}
                  size={Theme.fontSizes.xlarge}
                  color={Colors.primary}
                />
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                  <Ionicons name="close-circle-outline" size={Theme.fontSizes.xlarge} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalMessage}>{modalContent.message}</Text>

              {modalContent.actions && modalContent.actions.length > 0 ? (
                <View style={styles.modalActions}>
                  {modalContent.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.actionButton, action.type === 'cancel' ? styles.cancelButton : styles.confirmButton]}
                      onPress={action.onPress}
                      disabled={isLoading}
                    >
                      {isLoading && <ActivityIndicator color={Colors.cardBackground} style={{ marginRight: 5 }} />}
                      <Text style={styles.actionButtonText}>{action.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity style={styles.defaultCloseButton} onPress={hideModal} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={Colors.cardBackground} /> : <Text style={styles.defaultCloseButtonText}>Tutup</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: Theme.spacing.large,
    backgroundColor: Colors.cardBackground,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.xlarge,
    alignItems: 'center',
    ...Theme.shadows.medium,
    width: Dimensions.get('window').width * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.medium,
  },
  modalTitle: {
    fontSize: Theme.fontSizes.large,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.small,
  },
  closeButton: {
    padding: Theme.spacing.xsmall,
  },
  modalMessage: {
    marginBottom: Theme.spacing.large,
    textAlign: 'center',
    fontSize: Theme.fontSizes.medium,
    color: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    padding: Theme.spacing.small,
    borderRadius: Theme.borderRadius.pill,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.accent,
    marginLeft: Theme.spacing.small,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    marginRight: Theme.spacing.small,
  },
  actionButtonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
    fontSize: Theme.fontSizes.medium,
  },
  defaultCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.small,
    paddingHorizontal: Theme.spacing.large,
    borderRadius: Theme.borderRadius.pill,
    marginTop: Theme.spacing.medium,
  },
  defaultCloseButtonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
    fontSize: Theme.fontSizes.medium,
  }
});
