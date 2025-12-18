import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { StorageService } from '../../utils/storage';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

interface CartItem {
  id: number;
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

  React.useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const userId = await StorageService.getItem('user_id');
    if (!userId) return;

    try {
      const [cartRes, deliveryRes] = await Promise.all([
        CartService.getCartDetails(parseInt(userId)),
        CartService.getDeliveryCharge(parseInt(userId)),
      ]);

      if (cartRes.status === 1 && cartRes.result) {
        setCartItems(cartRes.result);
      }

      if (deliveryRes.status === 1 && deliveryRes.result?.area) {
        setDeliveryCharge(deliveryRes.result.area.delivery_charge || 0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await CartService.updateCart({ id: itemId, quantity: newQuantity });
      await loadCart();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity',
      });
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await CartService.removeFromCart(itemId);
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.sales_price * item.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Cart" />
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
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeButton}>🗑️</Text>
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
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateQuantity(item.id, item.quantity + 1)
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
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Checkout',
                  text2: 'Proceeding to checkout...',
                });
              }}
              style={styles.checkoutButton}
            >
              Proceed to Checkout
            </Button>
          </View>
        </>
      )}
    </View>
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
    fontSize: 20,
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
