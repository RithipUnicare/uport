import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
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

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await CartService.updateCart({ id: productId, quantity });
      await loadProducts();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Product" />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="shopping-cart" color="#fff" />
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
              <Card key={product.id} style={styles.productCard}>
                <Card.Content>
                  <Image
                    source={{
                      uri: `https://uports.in/admin${product.pro_image}`,
                    }}
                    style={styles.productImage}
                  />

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
                            >
                              {variant.product_size}
                            </Chip>
                          ),
                        )}
                      </View>

                      {selectedVariant.available_stock > 0 ? (
                        selectedVariant.quantity > 0 ? (
                          <View style={styles.quantityContainer}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() =>
                                updateQuantity(
                                  selectedVariant.id,
                                  selectedVariant.quantity - 1,
                                )
                              }
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantity}>
                              {selectedVariant.quantity}
                            </Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() =>
                                updateQuantity(
                                  selectedVariant.id,
                                  selectedVariant.quantity + 1,
                                )
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
                          >
                            ADD
                          </Button>
                        )
                      ) : (
                        <Text style={styles.outOfStock}>Out Of Stock</Text>
                      )}
                    </>
                  )}
                </Card.Content>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  productCard: {
    margin: 10,
    marginBottom: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 10,
  },
  offer: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  gst: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  variantChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BEBEBE',
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
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
  outOfStock: {
    color: '#f00',
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4caf50',
  },
});

export default ProductScreen;
