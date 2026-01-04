import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Badge,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';
import ApiService from '../../services/api';
import { StorageService } from '../../utils/storage';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>;

const ProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subcategoryId, subcategoryName } = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    loadProducts();
    loadCartCount();
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const id = await StorageService.getItem('user_id');
    if (id) setUserId(parseInt(id));
  };

  const loadCartCount = async () => {
    const count = await CartService.getCartCount();
    setCartCount(count);
  };

  const loadProducts = async () => {
    const id = await StorageService.getItem('user_id');
    try {
      const response = await ProductService.getProducts(
        subcategoryId,
        id ? parseInt(id) : 1,
      );
      if (response.status === 1 && response.products) {
        setProducts(response.products);
        // Set default selected variant (first one) for each product
        const defaults: { [key: number]: number } = {};
        response.products.forEach((product: any, index: number) => {
          if (product.list_product && product.list_product.length > 0) {
            defaults[index] = 0;
          }
        });
        setSelectedVariants(defaults);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please login to add items to cart',
      });
      return;
    }

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: productId,
        quantity: 1,
      });

      await loadCartCount();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item added to cart',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
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
      await loadProducts();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Product" color="#fff" />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="cart" color="#fff" />
            {cartCount > 0 && <Badge style={styles.badge}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {products.map((product, productIndex) => {
            const selectedVariantIndex = selectedVariants[productIndex] || 0;
            const selectedVariant = product.list_product[selectedVariantIndex];

            return (
              <Card key={productIndex} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  <Image
                    source={{
                      uri: ApiService.getImageUrl(product.pro_image),
                    }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.productDetails}>
                  <Text variant="titleMedium" style={styles.productName}>
                    {product.eng_name}
                  </Text>

                  {selectedVariant && (
                    <>
                      <View style={styles.priceContainer}>
                        <Text variant="titleLarge" style={styles.price}>
                          ₹{selectedVariant.sales_price}
                        </Text>
                        <Text style={styles.oldPrice}>
                          ₹{selectedVariant.regular_price}
                        </Text>
                        <Text style={styles.offer}>
                          ₹{selectedVariant.offer_price} off
                        </Text>
                      </View>

                      {selectedVariant.state_gst && (
                        <Text style={styles.gst}>
                          STATE GST - {selectedVariant.state_gst}
                        </Text>
                      )}
                      {selectedVariant.central_gst && (
                        <Text style={styles.gst}>
                          CENTRAL GST - {selectedVariant.central_gst}
                        </Text>
                      )}

                      <View style={styles.variantsContainer}>
                        {product.list_product.map(
                          (variant: any, variantIndex: number) => (
                            <Chip
                              key={variant.id}
                              selected={selectedVariantIndex === variantIndex}
                              onPress={() =>
                                setSelectedVariants(prev => ({
                                  ...prev,
                                  [productIndex]: variantIndex,
                                }))
                              }
                              style={styles.variantChip}
                              showSelectedOverlay
                              textStyle={{
                                color:
                                  selectedVariantIndex === variantIndex
                                    ? theme.colors.primary
                                    : '#666',
                              }}
                            >
                              {variant.product_size}
                            </Chip>
                          ),
                        )}
                      </View>

                      <View style={styles.actionContainer}>
                        {selectedVariant.available_stock > 0 ? (
                          selectedVariant.quantity > 0 ? (
                            <View style={styles.quantityContainer}>
                              <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() =>
                                  updateQuantity(selectedVariant.id, -1)
                                }
                              >
                                <Text style={styles.quantityButtonText}>−</Text>
                              </TouchableOpacity>
                              <Text style={styles.quantity}>
                                {selectedVariant.quantity}
                              </Text>
                              <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() =>
                                  updateQuantity(selectedVariant.id, 1)
                                }
                              >
                                <Text style={styles.quantityButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Button
                              mode="contained"
                              onPress={() => addToCart(selectedVariant.id)}
                              style={styles.addButton}
                              labelStyle={{ fontWeight: 'bold' }}
                            >
                              Add to Cart
                            </Button>
                          )
                        ) : (
                          <Text style={styles.outOfStock}>Out of Stock</Text>
                        )}
                      </View>
                    </>
                  )}
                </View>
              </Card>
            );
          })}

          {products.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text>Products not available</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  productCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    padding: 16,
  },
  productName: {
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontWeight: '800',
    color: '#1a1a1a',
    fontSize: 22,
    marginRight: 10,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
    marginRight: 10,
  },
  offer: {
    color: '#4caf50',
    fontWeight: '700',
    fontSize: 14,
  },
  gst: {
    fontSize: 11,
    color: '#757575',
    marginVertical: 1,
    fontWeight: '500',
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  variantChip: {
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    borderRadius: 12,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#b90617',
  },
  outOfStock: {
    color: '#d32f2f',
    fontWeight: '700',
    marginTop: 12,
    fontSize: 14,
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4caf50',
    fontSize: 10,
    height: 18,
    minWidth: 18,
  },
});

export default ProductScreen;
