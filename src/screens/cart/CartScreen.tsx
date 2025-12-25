import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  Button,
  Badge,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CartService from '../../services/cart.service';
import OrderService from '../../services/order.service';
import { StorageService } from '../../utils/storage';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  sales_price: number;
  regular_price: number;
  quantity: number;
  product_size: string;
}

const CartScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [minimumOrder, setMinimumOrder] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  React.useEffect(() => {
    navigation.addListener('focus', () => {
      loadCart();
    });
  }, []);

  const loadCart = async () => {
    const userIdStr = await StorageService.getItem('user_id');
    if (!userIdStr) return;

    const uid = parseInt(userIdStr);
    setUserId(uid);

    try {
      const [cartRes, deliveryRes, minOrderRes] = await Promise.all([
        CartService.getCartDetails(uid),
        CartService.getDeliveryCharge(uid),
        OrderService.getMinimumOrder(),
      ]);

      // Handle empty cart (status: 0)
      if (cartRes.status === 0 || cartRes.message === 'Your cart is empty') {
        setCartItems([]);
        return;
      }

      if (cartRes.status === 1 && cartRes.result) {
        setCartItems(cartRes.result);
      }

      if (deliveryRes.status === 1 && deliveryRes.result?.area) {
        setDeliveryCharge(deliveryRes.result.area.delivery_charge || 0);
      }

      if (minOrderRes.status === 1 && minOrderRes.minimum_order) {
        setMinimumOrder(minOrderRes.minimum_order);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const updateQuantity = async (productId: number, increment: number) => {
    if (!userId) return;

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: productId,
        quantity: increment, // +1 to add, -1 to subtract
      });
      await loadCart();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity',
      });
    }
  };

  const removeItem = async (productId: number, currentQuantity: number) => {
    if (!userId) return;

    try {
      // Reduce quantity to 0 by calling API with negative quantity
      await CartService.addToCart({
        user_id: userId,
        product_id: productId,
        quantity: 0, // Remove all quantity at once
      });
      await loadCart();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item removed from cart',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item',
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.sales_price * item.quantity,
      0,
    );
    return subtotal + deliveryCharge;
  };

  const handleCheckout = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please login to continue',
      });
      return;
    }

    if (subtotal < minimumOrder) {
      Toast.show({
        type: 'error',
        text1: 'Minimum Order',
        text2: `Minimum order amount is ₹${minimumOrder}`,
      });
      return;
    }

    setLoading(true);
    try {
      const products = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const response = await OrderService.placeOrder(userId, products);

      if (response.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Order placed successfully',
        });
        navigation.navigate('MyOrders');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to place order',
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to place order',
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.sales_price * item.quantity,
    0,
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="My Cart" color="#fff" />
      </Appbar.Header>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleLarge">Your cart is empty</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.shopButton}
          >
            Start Shopping
          </Button>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content}>
            {cartItems.map(item => (
              <Card key={item.id} style={styles.cartItem}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Text variant="titleMedium" style={styles.itemName}>
                      {item.product_name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeItem(item.product_id, 0)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={24}
                        color="#f44336"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.priceContainer}>
                      <Text variant="titleMedium" style={styles.price}>
                        ₹{item.sales_price}
                      </Text>
                      <Text style={styles.oldPrice}>₹{item.regular_price}</Text>
                      <Text style={styles.size}>{item.product_size}</Text>
                    </View>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateQuantity(
                            item.product_id,
                            Number(item.quantity) - 1,
                          )
                        }
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateQuantity(
                            item.product_id,
                            Number(item.quantity) + 1,
                          )
                        }
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            <Card style={styles.priceCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.priceTitle}>
                  PRICE DETAILS
                </Text>
                <View style={styles.priceLine}>
                  <Text>Price</Text>
                  <Text>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.priceLine}>
                  <Text>Delivery</Text>
                  <Text>₹{deliveryCharge.toFixed(2)}</Text>
                </View>
                <View style={[styles.priceLine, styles.totalLine]}>
                  <Text variant="titleMedium">Amount Payable</Text>
                  <Text variant="titleMedium">
                    ₹{calculateTotal().toFixed(2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text variant="titleMedium">Total</Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                ₹{calculateTotal().toFixed(2)}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
              loading={loading}
              disabled={loading || subtotal < minimumOrder}
            >
              {subtotal < minimumOrder
                ? `Minimum Order: ₹${minimumOrder}`
                : 'Proceed to Checkout'}
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  shopButton: {
    marginTop: 20,
  },
  cartItem: {
    margin: 10,
    marginBottom: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    fontWeight: 'bold',
  },
  removeButton: {
    fontSize: 24,
  },
  deleteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontWeight: 'bold',
    color: '#000',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 12,
  },
  size: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BEBEBE',
    borderRadius: 15,
  },
  quantityButton: {
    padding: 10,
    paddingHorizontal: 15,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#0A70A4',
  },
  priceCard: {
    margin: 10,
  },
  priceTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
    paddingTop: 10,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#b90617',
  },
  checkoutButton: {
    height: 50,
  },
});

export default CartScreen;
