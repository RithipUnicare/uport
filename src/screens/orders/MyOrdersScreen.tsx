import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import OrderService from '../../services/order.service';
import { StorageService } from '../../utils/storage';
import { Order } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyOrders'>;

const MyOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

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
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="My Orders" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="My Orders" color="#fff" />
      </Appbar.Header>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No orders yet
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Start shopping to see your orders here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders.map(order => (
            <Card
              key={order.order_id}
              style={styles.orderCard}
              onPress={() => {
                setSelectedOrder(order);
                setDialogVisible(true);
              }}
            >
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View>
                    <Text variant="titleMedium" style={styles.orderNumber}>
                      #{order.order_no}
                    </Text>
                    <Text variant="bodySmall" style={styles.orderDate}>
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
                    <Text style={styles.detailLabel}>Total Items</Text>
                    <Text style={styles.detailValue}>
                      {order.order_details?.length || 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Charge</Text>
                    <Text style={styles.detailValue}>
                      ₹{parseFloat(order.delivery_charge).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalAmount}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
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
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});

export default MyOrdersScreen;
