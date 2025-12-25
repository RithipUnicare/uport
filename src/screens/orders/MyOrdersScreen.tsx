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
                      {new Date(order.created_on).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip
                    style={{
                      backgroundColor: getStatusColor(order.order_status),
                    }}
                    textStyle={{ color: '#fff' }}
                  >
                    {getStatusLabel(order.order_status)}
                  </Chip>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Items:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>
                      {order.order_details?.length || 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Delivery:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>
                      ₹{parseFloat(order.delivery_charge).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text variant="titleMedium">Total:</Text>
                    <Text variant="titleMedium" style={styles.totalAmount}>
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
                    <Text variant="titleMedium">
                      Order #{selectedOrder.order_no}
                    </Text>
                    <Chip
                      style={{
                        backgroundColor: getStatusColor(
                          selectedOrder.order_status,
                        ),
                      }}
                      textStyle={{ color: '#fff', fontSize: 12 }}
                    >
                      {getStatusLabel(selectedOrder.order_status)}
                    </Chip>
                  </View>

                  <Text variant="bodySmall" style={styles.dialogDate}>
                    {new Date(selectedOrder.created_on).toLocaleDateString()}
                  </Text>

                  <Divider style={styles.divider} />

                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Products:
                  </Text>

                  {selectedOrder.order_details.map((item, index) => (
                    <Card key={index} style={styles.productCard}>
                      <Card.Content>
                        <Text variant="titleSmall" style={styles.productName}>
                          {item.product_name}
                        </Text>
                        <View style={styles.productDetails}>
                          <Text variant="bodySmall">
                            Quantity: {item.quantity}
                          </Text>
                          <Text variant="bodySmall">
                            Price: ₹{parseFloat(item.product_amount).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.productDetails}>
                          <Text
                            variant="bodySmall"
                            style={{ color: '#4CAF50' }}
                          >
                            Discount: ₹
                            {parseFloat(item.discount_amount).toFixed(2)}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ fontWeight: 'bold' }}
                          >
                            Total: ₹
                            {parseFloat(item.sale_tot_amount).toFixed(2)}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}

                  <Divider style={styles.divider} />

                  <View style={styles.dialogSummary}>
                    <View style={styles.summaryRow}>
                      <Text variant="bodyMedium">Delivery Charge:</Text>
                      <Text variant="bodyMedium">
                        ₹{parseFloat(selectedOrder.delivery_charge).toFixed(2)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text variant="titleMedium">Total Amount:</Text>
                      <Text variant="titleMedium" style={styles.totalAmount}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#666', textAlign: 'center' },
  orderCard: {
    margin: 10,
    marginBottom: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderNumber: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderDate: {
    color: '#666',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailValue: {
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 5,
    paddingTop: 10,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#b90617',
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: 20,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dialogDate: {
    color: '#666',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productCard: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dialogSummary: {
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
});

export default MyOrdersScreen;
