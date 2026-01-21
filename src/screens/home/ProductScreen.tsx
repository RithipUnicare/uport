import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';
import ApiService from '../../services/api';
import { StorageService } from '../../utils/storage';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>;

const { width } = Dimensions.get('window');

const ProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subcategoryId, subcategoryName, searchQuery, product: passedProduct } = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: number]: number;
  }>({});
  const [localQtys, setLocalQtys] = useState<{ [key: number]: string }>({});
  const [isInputFocused, setIsInputFocused] = useState<{ [key: number]: boolean }>({});

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
    const uId = id ? parseInt(id) : 1;
    try {
      if (passedProduct) {
        setProducts([passedProduct]);
        const defaults: { [key: number]: number } = { 0: 0 };
        setSelectedVariants(defaults);
        setLoading(false);
        return;
      }

      let response;
      if (searchQuery) {
        response = await ProductService.searchProducts(searchQuery.trim(), uId);
      } else if (subcategoryId) {
        response = await ProductService.getProducts(subcategoryId, uId);
      } else {
        setProducts([]);
        setLoading(false);
        return;
      }

      if (response.status === 1 && response.products) {
        setProducts(response.products);
        // Set default selected variant (first one) for each product
        const defaults: { [key: number]: number } = {};
        const qtyMap: { [key: number]: string } = {};
        response.products.forEach((product: any, index: number) => {
          if (product.list_product && product.list_product.length > 0) {
            defaults[index] = 0;
            const variant = product.list_product[0];
            qtyMap[variant.id] = (variant.quantity || 0).toString();
          }
        });
        setSelectedVariants(defaults);
        setLocalQtys(prev => ({ ...prev, ...qtyMap }));
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Products',
        text2: error?.response?.status === 404
          ? 'Product list endpoint not found (404)'
          : 'Could not connect to service',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: any) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please login to add items to cart',
      });
      return;
    }

    const index = products.indexOf(product);
    const selectedVariantIndex = selectedVariants[index] || 0;
    const selectedVariant = product.list_product?.[selectedVariantIndex];

    if (!selectedVariant) return;

    // Check if already in cart
    if (selectedVariant.quantity > 0) {
      Toast.show({
        type: 'info',
        text1: 'Already in Cart',
        text2: 'Please update the quantity directly',
      });
      return;
    }

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: selectedVariant.id,
        quantity: 1,
      });

      await loadCartCount();
      await loadProducts(); // Refresh to get updated quantities

      Toast.show({
        type: 'success',
        text1: '✓ Added to Cart',
        text2: 'Item successfully added',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
    }
  };

  const updateQuantity = async (productId: number, absoluteQty: number) => {
    if (!userId) return;

    // Prevent negative quantities
    if (absoluteQty < 0) return;

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: productId,
        quantity: absoluteQty,
      });
      await loadProducts(); // Refresh quantities
      await loadCartCount();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleManualQuantity = async (productId: number, currentQty: number, newQtyString: string) => {
    const newQty = parseInt(newQtyString);
    if (!isNaN(newQty) && newQty >= 0) {
      if (newQty !== currentQty) {
        await updateQuantity(productId, newQty);
      } else {
        setLocalQtys(prev => ({ ...prev, [productId]: currentQty.toString() }));
      }
    } else {
      loadProducts(); // Reset to valid state
    }
  };

  const handleQtyInputChange = (productId: number, text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setLocalQtys(prev => ({ ...prev, [productId]: cleanText }));
  };

  const calculateDiscount = (regular: number, sales: number) => {
    return Math.round(((regular - sales) / regular) * 100);
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={[theme.colors.primary, '#5D4037']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {subcategoryName || searchQuery || passedProduct?.eng_name || 'Products'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButtonContainer}
            >
              <View style={styles.cartIconWrapper}>
                <Icon name="cart-outline" size={26} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading amazing products...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {products.map((product, productIndex) => {
            const selectedVariantIndex = selectedVariants[productIndex] || 0;
            const selectedVariant = product.list_product[selectedVariantIndex];
            const discount = selectedVariant
              ? calculateDiscount(
                selectedVariant.regular_price,
                selectedVariant.sales_price
              )
              : 0;

            return (
              <View key={productIndex} style={styles.productCard}>
                {/* Horizontal Layout Container */}
                <View style={styles.horizontalContainer}>

                  {/* Left: Image */}
                  <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: ApiService.getImageUrl(product.pro_image) }}
                        style={styles.productImage}
                        resizeMode="contain"
                      />
                    </View>
                    {discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discount}% OFF</Text>
                      </View>
                    )}
                  </View>

                  {/* Right: Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.eng_name}
                    </Text>

                    {selectedVariant && (
                      <>
                        {/* Price Row */}
                        <View style={styles.priceRow}>
                          <Text style={styles.currentPrice}>₹{selectedVariant.sales_price}</Text>
                          <Text style={styles.originalPrice}>₹{selectedVariant.regular_price}</Text>
                        </View>

                        {/* Size Selector (Compact) */}
                        {product.list_product.length > 1 && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeScroll}>
                            {product.list_product.map((variant: any, variantIndex: number) => (
                              <TouchableOpacity
                                key={variant.id}
                                onPress={() => setSelectedVariants(prev => ({ ...prev, [productIndex]: variantIndex }))}
                                style={[
                                  styles.sizeChip,
                                  selectedVariantIndex === variantIndex && styles.sizeChipSelected
                                ]}
                              >
                                <Text style={[
                                  styles.sizeChipText,
                                  selectedVariantIndex === variantIndex && styles.sizeChipTextSelected
                                ]}>
                                  {variant.product_size}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}

                        {/* Stock Warning */}
                        {selectedVariant.available_stock > 0 && selectedVariant.available_stock <= 5 && (
                          <Text style={styles.stockWarningText}>Running Low: Only {selectedVariant.available_stock} left</Text>
                        )}
                      </>
                    )}
                  </View>
                </View>

                {/* Bottom: Action Control (Full Width) */}
                {selectedVariant && (
                  <View style={styles.actionSection}>
                    {selectedVariant.available_stock > 0 ? (
                      selectedVariant.quantity > 0 ? (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => updateQuantity(selectedVariant.id, Math.max(0, selectedVariant.quantity - 1))}
                            disabled={isInputFocused[selectedVariant.id]}
                          >
                            <Icon name="minus" size={16} color={theme.colors.primary} />
                          </TouchableOpacity>

                          <TextInput
                            style={styles.quantityInput}
                            value={localQtys[selectedVariant.id] || selectedVariant.quantity.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) => handleQtyInputChange(selectedVariant.id, text)}
                            onEndEditing={(e) => handleManualQuantity(selectedVariant.id, selectedVariant.quantity, e.nativeEvent.text)}
                          />

                          <TouchableOpacity
                            style={[styles.quantityBtn, styles.quantityBtnPlus]}
                            onPress={() => updateQuantity(selectedVariant.id, parseInt(selectedVariant.quantity.toString()) + 1)}
                            disabled={isInputFocused[selectedVariant.id]}
                          >
                            <Icon name="plus" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addToCartBtn}
                          onPress={() => addToCart(product)}
                        >
                          <Text style={styles.addToCartText}>ADD TO CART</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View style={styles.outOfStockBtn}>
                        <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {products.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="package-variant" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new arrivals
              </Text>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  headerGradient: {
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  cartButtonContainer: {
    marginLeft: 12,
  },
  cartIconWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 0,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  imageSection: {
    width: 100,
    height: 100,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  detailsSection: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sizeScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  sizeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sizeChipSelected: {
    backgroundColor: '#5D4037',
    borderColor: '#5D4037',
  },
  sizeChipText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  sizeChipTextSelected: {
    color: '#fff',
  },
  stockWarningText: {
    fontSize: 10,
    color: '#F57C00',
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 2,
    height: 36,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quantityBtnPlus: {
    backgroundColor: '#5D4037',
    borderColor: '#5D4037',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    padding: 0,
    height: '100%',
  },
  addToCartBtn: {
    backgroundColor: '#5D4037',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  outOfStockBtn: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  bottomSpace: {
    height: 20,
  },
});

export default ProductScreen;
