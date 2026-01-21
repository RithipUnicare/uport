import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,

  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  Button,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CartService from '../../services/cart.service';
import OrderService from '../../services/order.service';
import { StorageService, STORAGE_KEYS } from '../../utils/storage';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GradientHeader from '../../components/GradientHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  pro_name?: string;
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
  const [localQtys, setLocalQtys] = useState<{ [key: number]: string }>({});
  const [isInputFocused, setIsInputFocused] = useState<{ [key: number]: boolean }>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    navigation.addListener('focus', () => {
      loadCart();
    });

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
  }, [navigation, fadeAnim, slideAnim]);

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
        // Sync local quantities
        const qtyMap: { [key: number]: string } = {};
        cartRes.result.forEach((item: CartItem) => {
          qtyMap[item.product_id] = item.quantity.toString();
        });
        setLocalQtys(prev => ({ ...prev, ...qtyMap }));
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

  const updateQuantity = async (productId: number, absoluteQty: number) => {
    if (!userId) return;

    // Prevent quantity from going below 1 via this method
    if (absoluteQty < 1) return;

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: productId,
        quantity: absoluteQty,
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

  const handleManualQuantity = async (productId: number, currentQty: number, newQtyString: string) => {
    const newQty = parseInt(newQtyString);
    if (!isNaN(newQty) && newQty > 0) {
      if (newQty !== currentQty) {
        await updateQuantity(productId, newQty);
      } else {
        setLocalQtys(prev => ({ ...prev, [productId]: currentQty.toString() }));
      }
    } else {
      loadCart(); // Reset to valid state
    }
  };

  const handleQtyInputChange = (productId: number, text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setLocalQtys(prev => ({ ...prev, [productId]: cleanText }));
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
        // Clear cart count in storage
        await StorageService.setItem(STORAGE_KEYS.CART_VAL, '0');
        navigation.replace('Home');
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

  const subtotal = Math.max(0, cartItems.reduce(
    (sum, item) => sum + item.sales_price * item.quantity,
    0,
  ));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GradientHeader
        title="My Cart"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {cartItems.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>Your cart is empty</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.shopButton}
          >
            Start Shopping
          </Button>
        </Animated.View>
      ) : (
        <>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <Animated.FlatList
              style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
              data={cartItems}
              renderItem={({ item }) => (
                <Card key={item.product_id} style={styles.cartItem}>
                  <Card.Content>
                    <View style={styles.itemHeader}>
                      <Text
                        variant="titleMedium"
                        style={[styles.itemName, { color: theme.colors.onSurface }]}
                        numberOfLines={2}
                      >
                        {item.pro_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeItem(item.product_id, 0)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={22}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.itemDetails}>
                      <View style={styles.priceContainer}>
                        <Text variant="titleMedium" style={[styles.price, { color: theme.colors.onSurface }]}>
                          ₹{item.sales_price}
                        </Text>
                        <Text style={[styles.oldPrice, { color: theme.colors.onSurfaceVariant }]}>
                          ₹{item.regular_price}
                        </Text>
                        <Text style={[styles.size, { color: theme.colors.onSurfaceVariant }]}>{item.product_size}</Text>
                      </View>

                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={[styles.quantityButton, isInputFocused[item.product_id] && { opacity: 0.5 }]}
                          onPress={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          disabled={isInputFocused[item.product_id]}
                        >
                          <Text style={[styles.quantityButtonText, { color: theme.colors.primary }]}>−</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.quantityInput, { color: theme.colors.primary }]}
                          value={localQtys[item.product_id] || Math.max(1, item.quantity).toString()}
                          keyboardType="numeric"
                          selectTextOnFocus={true}
                          onFocus={() => setIsInputFocused(prev => ({ ...prev, [item.product_id]: true }))}
                          onBlur={() => setIsInputFocused(prev => ({ ...prev, [item.product_id]: false }))}
                          onChangeText={(text) => handleQtyInputChange(item.product_id, text)}
                          onEndEditing={(e) => handleManualQuantity(item.product_id, item.quantity, e.nativeEvent.text)}
                        />
                        <TouchableOpacity
                          style={[styles.quantityButton, isInputFocused[item.product_id] && { opacity: 0.5 }]}
                          onPress={() => { updateQuantity(item.product_id, parseInt(item.quantity.toString()) + 1); }}
                          disabled={isInputFocused[item.product_id]}
                        >
                          <Text style={[styles.quantityButtonText, { color: theme.colors.primary }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              )}
              keyExtractor={(item) => item.product_id.toString()}
              ListFooterComponent={() => (
                <Card style={styles.priceCard}>
                  <Card.Content>
                    <Text variant="titleMedium" style={[styles.priceTitle, { color: theme.colors.onSurface }]}>
                      Price Details
                    </Text>
                    <View style={styles.priceLine}>
                      <Text style={[styles.priceLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Price ({cartItems.length} items)
                      </Text>
                      <Text style={[styles.priceValue, { color: theme.colors.onSurface }]}>
                        ₹{subtotal.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.priceLine}>
                      <Text style={[styles.priceLabel, { color: theme.colors.onSurfaceVariant }]}>Delivery Charges</Text>
                      <Text
                        style={[
                          styles.priceValue,
                          { color: deliveryCharge === 0 ? theme.colors.primary : theme.colors.onSurface },
                        ]}
                      >
                        {deliveryCharge === 0
                          ? 'FREE'
                          : `₹${deliveryCharge.toFixed(2)}`}
                      </Text>
                    </View>
                    <View style={[styles.priceLine, styles.totalLine]}>
                      <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total Amount</Text>
                      <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                        ₹{calculateTotal().toFixed(2)}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              )}
            />
          </KeyboardAvoidingView>

          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
            <View style={styles.footerTotalContainer}>
              <View>
                <Text style={[styles.footerTotalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Payable</Text>
                <Text style={[styles.footerTotalAmount, { color: theme.colors.primary }]}>
                  ₹{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
              labelStyle={styles.checkoutButtonLabel}
              loading={loading}
              disabled={loading || subtotal < minimumOrder}
            >
              {subtotal < minimumOrder
                ? `Add ₹${(minimumOrder - subtotal).toFixed(0)} more`
                : 'Place Order'}
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
    // backgroundColor will be set via theme
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shopButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  cartItem: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontWeight: '800',
    color: '#1a1a1a',
    fontSize: 18,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  size: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 4,
    height: 40,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'center',
    padding: 0,
    height: '100%',
  },
  priceCard: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceTitle: {
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    color: '#666',
    fontSize: 14,
  },
  priceValue: {
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: 14,
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
  },
  footerTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  footerTotalAmount: {
    fontWeight: '800',
    fontSize: 24,
  },
  checkoutButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CartScreen;
