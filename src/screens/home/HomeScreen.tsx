import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  FlatList,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Searchbar,
  Card,
  Text,
  ActivityIndicator,
  Badge,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';
import AuthService from '../../services/auth.service';
import ApiService from '../../services/api';
import { StorageService } from '../../utils/storage';
import CameraService from '../../services/camera.service';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '../../services/api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('1');
  const [cartCount, setCartCount] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [userId, setUserId] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: number }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUserData();
    loadHomeData();
    loadCartCount();
    loadUserId();
    startAnimations();
  }, []);

  const loadUserId = async () => {
    const id = await StorageService.getItem('user_id');
    if (id) setUserId(parseInt(id));
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

    const selectedVariantIndex = selectedVariants[product.id] || 0;
    const selectedVariant = product.list_product?.[selectedVariantIndex];

    if (!selectedVariant) return;

    try {
      await CartService.addToCart({
        user_id: userId,
        product_id: selectedVariant.id,
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

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
    const user = await AuthService.getCurrentUser();
    if (user.name) setUserName(user.name);
    if (user.user_type) setUserType(user.user_type);
  };

  const loadCartCount = async () => {
    const count = await CartService.getCartCount();
    setCartCount(count);
  };

  const loadHomeData = async () => {
    try {
      const userId = await StorageService.getItem('user_id');
      const [bannersRes, categoriesRes, featuredRes] = await Promise.all([
        ProductService.getBanners(parseInt(userType)),
        ProductService.getCategories(),
        ProductService.getFeaturedProducts(userId ? parseInt(userId) : 1),
      ]);

      if (bannersRes.status === 1 && bannersRes.sliders) {
        setBanners(
          bannersRes.sliders.map(s => bannersRes.image_url + s.slider),
        );
      }

      if (
        Array.isArray(categoriesRes.categories) &&
        categoriesRes.categories.length > 0
      ) {
        const categoriesWithImages = categoriesRes.categories.map(cat => ({
          ...cat,
          image: cat.image,
        }));
        setCategories(categoriesWithImages);
      }

      if (featuredRes.status === 1 && featuredRes.products) {
        // Take only first 6 featured products
        console.log('Featured products loaded:', featuredRes.products.length);
        setFeaturedProducts(featuredRes.products.slice(0, 6));
      } else {
        console.log('No featured products found, using fallback');
        // Fallback with sample products for demo
        const sampleProducts = [
          {
            id: 1,
            eng_name: 'Fresh Tomatoes',
            pro_image: 'sample/tomatoes.jpg',
            list_product: [{
              id: 1,
              product_size: '1 kg',
              sales_price: 40,
              regular_price: 50,
              available_stock: 10,
            }]
          },
          {
            id: 2,
            eng_name: 'Organic Rice',
            pro_image: 'sample/rice.jpg',
            list_product: [{
              id: 2,
              product_size: '5 kg',
              sales_price: 280,
              regular_price: 320,
              available_stock: 5,
            }]
          },
          {
            id: 3,
            eng_name: 'Fresh Milk',
            pro_image: 'sample/milk.jpg',
            list_product: [{
              id: 3,
              product_size: '1 L',
              sales_price: 65,
              regular_price: 70,
              available_stock: 15,
            }]
          }
        ];
        setFeaturedProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    await loadCartCount();
    setRefreshing(false);
  };

  const handleUploadList = async () => {
    const userId = await StorageService.getItem('user_id');
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please login to continue',
      });
      return;
    }

    try {
      const image = await CameraService.openCamera();
      if (image) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image captured successfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to capture image',
      });
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
     
      <Appbar.Header style={{ backgroundColor: theme.colors.primary, elevation: 0 }}>
        <Appbar.Content title="Routegadi" titleStyle={{ color: '#fff', fontWeight: '700' }} />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="cart" color={theme.colors.onSurfaceVariant} iconColor='#fff'/>
            {cartCount > 0 && <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>
     <LinearGradient colors={[theme.colors.primary, theme.colors.background]} style={styles.gradient}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.welcomeContainer}>
            {/* <Text style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
              Good morning{userName && userType !== '3' ? `, ${userName}` : ''}!
            </Text> */}
            <Text style={[styles.subtitleText, { color: theme.colors.onSurfaceVariant }]}>
              What would you like to order today?
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search for groceries, brands..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
              iconColor={theme.colors.onSurfaceVariant}
              inputStyle={{ color: theme.colors.onSurface }}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </View>
        </View>

        {banners.length > 0 && (
          <View style={[styles.bannerContainer, { marginTop: 30 }]}>
            <Image
              source={{ uri: `${BASE_URL}${banners[currentBannerIndex]}` }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.indicators}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentBannerIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {loading ? (
          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredProductsContainer}
              data={[1, 2, 3]}
              renderItem={({  }) => (
                <View style={styles.featuredProductCard}>
                  <View style={styles.featuredProductTouchable}>
                    <View style={[styles.featuredProductImageContainer, styles.loadingShimmer]} />
                    <View style={styles.featuredProductDetails}>
                      <View style={[styles.loadingShimmer, { height: 16, marginBottom: 8, borderRadius: 4 }]} />
                      <View style={[styles.loadingShimmer, { height: 14, width: '60%', borderRadius: 4 }]} />
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.toString()}
            />
          </View>
        ) : featuredProducts.length > 0 ? (
          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Featured Products</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SubCategory', {
                    categoryId: categories[0]?.id || 1,
                    categoryName: categories[0]?.name || 'Products',
                  })
                }
              >
                <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            <Animated.FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredProductsContainer}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
              data={featuredProducts}
              renderItem={({ item: product, index }) => {
                const selectedVariantIndex = selectedVariants[product.id] || 0;
                const selectedVariant = product.list_product?.[selectedVariantIndex];
                const hasMultipleVariants = product.list_product && product.list_product.length > 1;

                return (
                  <View style={[styles.featuredProductCard, { backgroundColor: '#e8f5e8' }]}>
                    <TouchableOpacity
                      style={styles.featuredProductTouchable}
                      onPress={() =>
                        navigation.navigate('SubCategory', {
                          categoryId: categories[0]?.id || 1,
                          categoryName: categories[0]?.name || 'Products',
                        })
                      }
                    >
                      <View style={styles.featuredProductImageContainer}>
                        <Image
                          source={{
                            uri: ApiService.getImageUrl(product.pro_image),
                          }}
                          style={styles.featuredProductImage}
                          resizeMode="cover"
                          onLoadStart={() => {/* Could add loading state */}}
                          onError={(error) => {
                            console.log('Image load error:', error.nativeEvent.error);
                          }}
                        />
                        {selectedVariant?.available_stock === 0 && (
                          <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.featuredProductDetails}>
                        <Text
                          style={[styles.featuredProductName, { color: theme.colors.onSurface }]}
                          numberOfLines={2}
                        >
                          {product.eng_name}
                        </Text>

                        {hasMultipleVariants && (
                          <TouchableOpacity
                            style={styles.variantSelector}
                            onPress={() => {
                              const nextVariant = (selectedVariantIndex + 1) % product.list_product.length;
                              setSelectedVariants(prev => ({
                                ...prev,
                                [product.id]: nextVariant,
                              }));
                            }}
                          >
                            <Text style={[styles.variantText, { color: theme.colors.onSurfaceVariant }]}>
                              {selectedVariant?.product_size || 'Select Size'}
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-down"
                              size={16}
                              color="#718096"

                            />
                          </TouchableOpacity>
                        )}

                        {selectedVariant && (
                          <View style={styles.featuredPriceContainer}>
                            <Text style={[styles.featuredPrice, { color: theme.colors.primary }]}>
                              ₹{selectedVariant.sales_price}
                            </Text>
                            {selectedVariant.regular_price !== selectedVariant.sales_price && (
                              <Text style={[styles.featuredOldPrice, { color: theme.colors.onSurfaceVariant }]}>
                                ₹{selectedVariant.regular_price}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    {selectedVariant && selectedVariant.available_stock > 0 && (
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => addToCart(product)}
                      >
                        <MaterialCommunityIcons
                          name="cart-plus"
                          size={20}
                          color="#fff"
                        />
                        {/* <Text style={styles.addToCartText}>Add</Text> */}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            />
          </View>
        ) : !loading && (
          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
            <View style={styles.emptyProductsContainer}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#cbd5e0"
              />
              <Text style={[styles.emptyProductsText, { color: theme.colors.onSurfaceVariant }]}>No featured products available</Text>
            </View>
          </View>
        )}

        <View style={[styles.sectionContainer, { marginTop: 15 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Shop by Category</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SubCategory', {
                  categoryId: categories[0]?.id || 1,
                  categoryName: categories[0]?.name || 'All Categories',
                })
              }
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: '#f0f9ff' }]}
                  onPress={() =>
                    navigation.navigate('SubCategory', {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                >
                  <View style={styles.categoryImageContainer}>
                    {category.image && ApiService.getImageUrl(category.image) ? (
                      <Image
                        source={{
                          uri: ApiService.getImageUrl(category.image),
                        }}
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#cbd5e0',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                          {category.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.categoryName, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.sectionContainer, { marginTop: 15 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#e6fffa' }]} onPress={handleUploadList}>
                <View style={styles.quickActionTouchable}>
                  <View style={[styles.quickActionIconContainer, { backgroundColor: '#e6fffa' }]}>
                    <Image
                      source={require('../../../cordova-source/img/list.png')}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>Upload List</Text>
                  <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>Camera/Gallery</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#ebf8ff' }]}
                onPress={() => navigation.navigate('MyOrders')}
              >
                <View style={styles.quickActionTouchable}>
                  <View style={[styles.quickActionIconContainer, { backgroundColor: '#ebf8ff' }]}>
                    <MaterialCommunityIcons
                      name="shopping-outline"
                      size={24}
                      color="#3182ce"
                    />
                  </View>
                  <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>My Orders</Text>
                  <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>Reorder/Return</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: '#f0fff4' }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.quickActionTouchable}>
                  <View style={[styles.quickActionIconContainer, { backgroundColor: '#f0fff4' }]}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={24}
                      color="#38a169"
                    />
                  </View>
                  <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>Profile</Text>
                  <Text style={[styles.quickActionSubtitle, { color: theme.colors.onSurfaceVariant }]}>Manage Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      </LinearGradient>
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Appbar.Action icon="home" color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <View>
            <Appbar.Action icon="cart" color={theme.colors.onSurfaceVariant} />
            {cartCount > 0 && <Badge style={[styles.badge, { top: 0, right: 0, backgroundColor: theme.colors.error }]}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Appbar.Action icon="shopping" color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Appbar.Action icon="cog" color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
  
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: '#718096',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 0,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    width: 18,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
  },
  featuredProductsContainer: {
    paddingLeft: 16,
  },
  featuredProductCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 20,
  },
  featuredProductTouchable: {
    flex: 1,
  },
  featuredProductImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredProductImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#e53e3e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredProductDetails: {
    padding: 10,
  },
  featuredProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 6,
    lineHeight: 16,
  },
  variantSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  variantText: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '500',
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38a169',
  },
  featuredOldPrice: {
    fontSize: 12,
    color: '#a0aec0',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: height*0.18,
    right: 8,
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 3,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 22,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4a5568',
    lineHeight: 16,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionTouchable: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6fffa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 8,
    height: 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e53e3e',
    fontSize: 10,
    height: 18,
    minWidth: 18,
    borderRadius: 9,
  },
  emptyProductsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingShimmer: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  gradient: {
    flex: 1,
  },
});

export default HomeScreen;
