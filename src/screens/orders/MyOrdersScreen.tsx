import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, Easing, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  Chip,
  useTheme,
  Portal,
  Dialog,
  Button,
  Divider,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import OrderService from '../../services/order.service';
import { StorageService } from '../../utils/storage';
import { Order } from '../../types';
import GradientHeader from '../../components/GradientHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'MyOrders'>;

const MyOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadOrders();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadOrders = async () => {
    const userId = await StorageService.getItem('user_id');
    if (!userId) return;

    try {
      const response = await OrderService.getMyOrders(parseInt(userId));
      console.log(response);
      if (response.status === 1 && response.order) {
        setOrders(response.order);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const userId = await StorageService.getItem('user_id');
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not logged in',
        });
        return;
      }

      setLoading(true);
      const response = await OrderService.cancelOrder(orderId, parseInt(userId));
      if (response.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Order Cancelled',
          text2: 'Your order has been cancelled successfully.',
        });
        setDialogVisible(false);
        await loadOrders();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to cancel order',
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (statusCode: string) => {
    switch (statusCode) {
      case '1':
        return 'Pending';
      case '2':
        return 'Processing';
      case '3':
        return 'Delivered';
      case '4':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case '1':
        return '#FFA500'; // Pending
      case '2':
        return '#2196F3'; // Processing
      case '3':
        return '#4CAF50'; // Delivered
      case '4':
        return '#F44336'; // Cancelled
      default:
        return theme.colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="My Orders"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GradientHeader
        title="My Orders"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'active' && styles.activeTabText,
                { color: activeTab === 'active' ? '#fff' : theme.colors.onSurfaceVariant }
              ]}
            >
              Active Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
            onPress={() => setActiveTab('cancelled')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'cancelled' && styles.activeTabText,
                { color: activeTab === 'cancelled' ? '#fff' : theme.colors.onSurfaceVariant }
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {orders.filter(order => activeTab === 'cancelled' ? order.order_status === '4' : order.order_status !== '4').length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>
            No {activeTab} orders yet
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {activeTab === 'active' ? 'Start shopping to see your orders here' : 'No cancelled orders found'}
          </Text>
        </Animated.View>
      ) : (
        <Animated.FlatList
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          data={orders.filter(order => activeTab === 'cancelled' ? order.order_status === '4' : order.order_status !== '4')}
          renderItem={({ item: order }) => (
            <Card
              style={styles.orderCard}
              onPress={() => {
                setSelectedOrder(order);
                setDialogVisible(true);
              }}
            >
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View>
                    <Text variant="titleMedium" style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                      #{order.order_no}
                    </Text>
                    <Text variant="bodySmall" style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
                      Ordered on{' '}
                      {new Date(order.created_on).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(order.order_status) },
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(order.order_status)}
                  </Chip>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Total Items</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {order.order_details?.length || 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Delivery Charge</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      ₹{parseFloat(order.delivery_charge).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Grand Total</Text>
                    <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
          keyExtractor={(item) => item.order_id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Order Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              {selectedOrder && (
                <>
                  <View style={styles.dialogHeader}>
                    <Text variant="titleMedium" style={styles.orderNumber}>
                      Order #{selectedOrder.order_no}
                    </Text>
                    <Chip
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: getStatusColor(
                            selectedOrder.order_status,
                          ),
                        },
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {getStatusLabel(selectedOrder.order_status)}
                    </Chip>
                  </View>

                  <Text variant="bodySmall" style={styles.dialogDate}>
                    Ordered on{' '}
                    {new Date(selectedOrder.created_on).toLocaleDateString()}
                  </Text>

                  <Divider style={styles.divider} />

                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Items Ordered
                  </Text>

                  {selectedOrder.order_details.map((item, index) => (
                    <Card key={index} style={styles.productCard}>
                      <Card.Content>
                        <Text variant="titleSmall" style={styles.productName}>
                          {item.product_name}
                        </Text>
                        <View style={styles.productDetailsContainer}>
                          <Text style={styles.productDetailText}>
                            Quantity:{' '}
                            <Text style={styles.productDetailBold}>
                              {item.quantity}
                            </Text>
                          </Text>
                          <Text style={styles.productDetailText}>
                            Price:{' '}
                            <Text style={styles.productDetailBold}>
                              ₹{parseFloat(item.product_amount).toFixed(2)}
                            </Text>
                          </Text>
                        </View>
                        <View style={styles.productDetailsContainer}>
                          <Text
                            style={[
                              styles.productDetailText,
                              { color: '#4CAF50' },
                            ]}
                          >
                            Discount: ₹
                            {parseFloat(item.discount_amount).toFixed(2)}
                          </Text>
                          <Text style={styles.productDetailText}>
                            Total:{' '}
                            <Text style={styles.productDetailBold}>
                              ₹{parseFloat(item.sale_tot_amount).toFixed(2)}
                            </Text>
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}

                  <Divider style={styles.divider} />

                  <View style={styles.dialogSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.detailLabel}>Delivery Charge</Text>
                      <Text style={styles.detailValue}>
                        ₹{parseFloat(selectedOrder.delivery_charge).toFixed(2)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Amount Paid</Text>
                      <Text style={styles.totalAmount}>
                        ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            {selectedOrder?.order_status === '1' && (
              <Button
                disabled={true}
                textColor={theme.colors.error}
              >
                Cancel Order
              </Button>
            )}
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set via theme
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontWeight: '800',
    marginBottom: 8,
    color: '#1a1a1a',
    fontSize: 20,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontWeight: '800',
    color: '#1a1a1a',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  orderDate: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  statusChip: {
    height: 28,
    borderRadius: 8,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontWeight: '800',
    color: '#b90617',
    fontSize: 16,
  },
  dialog: {
    borderRadius: 24,
    backgroundColor: '#fff',
    maxHeight: '85%',
  },
  dialogContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dialogDate: {
    color: '#666',
    fontSize: 13,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 12,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productName: {
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  productDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productDetailText: {
    fontSize: 13,
    color: '#666',
  },
  productDetailBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dialogSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#5D4037', // Brown theme
  },
  tabText: {
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
});

export default MyOrdersScreen;
