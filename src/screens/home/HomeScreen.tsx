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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Searchbar,
  Text,
  ActivityIndicator,
  useTheme,
  IconButton,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [featuredSubCatId, setFeaturedSubCatId] = useState<number | null>(null);
  const [localQtys, setLocalQtys] = useState<{ [key: number]: string }>({});
  const [isInputFocused, setIsInputFocused] = useState<{ [key: number]: boolean }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const productAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
      loadHomeData();
      loadCartCount();
      loadUserId();
    });

    startAnimations();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isSearchFocused) {
      const delayDebounceFn = setTimeout(() => {
        if (searchQuery.trim()) {
          performSearch();
        } else {
          setSearchResults(featuredProducts);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, isSearchFocused]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await ProductService.searchProducts(searchQuery, userId);
      if (response.status === 1 && response.products) {
        setSearchResults(response.products);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      Toast.show({
        type: 'error',
        text1: 'Search Failed',
        text2: error?.response?.status === 404
          ? 'Search endpoint not found (404)'
          : 'Could not connect to search service',
      });
    } finally {
      setIsSearching(false);
    }
  };

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
      await loadHomeData(); // Refresh to get updated quantities
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
      await loadHomeData(); // Refresh quantities
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
    }
  };

  const handleQtyInputChange = (productId: number, text: string) => {
    // Only allow numeric input
    const cleanText = text.replace(/[^0-9]/g, '');
    setLocalQtys(prev => ({ ...prev, [productId]: cleanText }));
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
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(productAnim, {
        toValue: 1,
        duration: 600,
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
        setFeaturedProducts(featuredRes.products.slice(0, 6));
        if (featuredRes.subcategoryId) setFeaturedSubCatId(featuredRes.subcategoryId);

        // Sync local quantities
        const qtyMap: { [key: number]: string } = {};
        featuredRes.products.slice(0, 6).forEach((p: any) => {
          const variant = p.list_product?.[selectedVariants[p.id] || 0];
          if (variant) qtyMap[variant.id] = (variant.quantity || 0).toString();
        });
        setLocalQtys(prev => ({ ...prev, ...qtyMap }));
      }
    } catch (error: any) {
      console.error('Error loading home data:', error);
      if (error?.response?.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Data Not Found',
          text2: 'Some home screen data could not be loaded (404).',
        });
      }
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

  const calculateDiscount = (regular: number, sales: number) => {
    return Math.round(((regular - sales) / regular) * 100);
  };

  const mainContent = (
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
            <View style={styles.headerLeft}>
              <Text style={styles.appName}>ROUTE GADI</Text>
              <Text style={styles.appTagline}>Grocery Store</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButton}
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

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search for products..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              onFocus={() => {
                setIsSearchFocused(true);
                if (!searchQuery) setSearchResults(featuredProducts);
              }}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  setIsSearchFocused(false);
                  navigation.navigate('Product', { searchQuery: searchQuery.trim() });
                }
              }}
              onIconPress={() => {
                if (searchQuery.trim()) {
                  setIsSearchFocused(false);
                  navigation.navigate('Product', { searchQuery: searchQuery.trim() });
                }
              }}
              style={styles.searchBar}
              iconColor="#666"
              inputStyle={styles.searchInput}
              placeholderTextColor="#999"
              icon="magnify"
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {searchQuery.length > 0 && (
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => {
                        setSearchQuery('');
                        setSearchResults(featuredProducts);
                      }}
                    />
                  )}
                  <IconButton
                    icon="magnify"
                    size={24}
                    iconColor={theme.colors.primary}
                    onPress={() => {
                      if (searchQuery.trim()) {
                        setIsSearchFocused(false);
                        navigation.navigate('Product', { searchQuery: searchQuery.trim() });
                      }
                    }}
                  />
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search Results Overlay */}
      {isSearchFocused && (
        <View style={styles.searchResultsOverlay}>
          <TouchableOpacity
            style={styles.overlayBackdrop}
            activeOpacity={1}
            onPress={() => setIsSearchFocused(false)}
          />
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchQuery ? 'Search results' : 'Available products'}
              </Text>
              <TouchableOpacity onPress={() => setIsSearchFocused(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <ActivityIndicator style={{ padding: 20 }} color={theme.colors.primary} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      setIsSearchFocused(false);
                      // Navigate to Product screen with the search query
                      navigation.navigate('Product', {
                        product: item
                      });
                    }}
                  >
                    <Image
                      source={{ uri: ApiService.getImageUrl(item.pro_image) }}
                      style={styles.resultImage}
                    />
                    <View style={styles.resultDetails}>
                      <Text style={styles.resultName} numberOfLines={1}>{item.eng_name}</Text>
                      <Text style={styles.resultPrice}>₹{item.list_product?.[0]?.sales_price || '0'}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyResults}>
                    <Text style={styles.emptyResultsText}>No products found</Text>
                  </View>
                }
                style={{ maxHeight: Dimensions.get('window').height * 0.5 }}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <Animated.View
            style={[
              styles.bannerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={{ uri: `${BASE_URL}${banners[currentBannerIndex]}` }}
              style={styles.bannerImage}
              resizeMode="stretch"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerIndicators}>
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
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActionsSection,
            { opacity: categoryAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleUploadList}
          >
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <Icon name="camera" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Upload List</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                <Icon name="package-variant" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>My Orders</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={['#FFF3E0', '#FFE0B2']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
                <Icon name="account" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories */}
        <Animated.View
          style={[
            styles.section,
            { opacity: categoryAnim, transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('SubCategory', {
                    categoryId: category.id,
                    categoryName: category.name,
                  })
                }
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F5F5F5']}
                  style={styles.categoryImageContainer}
                >
                  {category.image && ApiService.getImageUrl(category.image) ? (
                    <Image
                      source={{
                        uri: ApiService.getImageUrl(category.image),
                      }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.categoryPlaceholder}>
                      <Text style={styles.categoryPlaceholderText}>
                        {category.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: productAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity
                onPress={() => {
                  if (featuredSubCatId) {
                    navigation.navigate('Product', {
                      subcategoryId: featuredSubCatId,
                      subcategoryName: 'Featured Products',
                    });
                  } else {
                    navigation.navigate('Categories');
                  }
                }}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <Animated.FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
              style={{ opacity: productAnim }}
              data={featuredProducts}
              renderItem={({ item: product }) => {
                const selectedVariantIndex = selectedVariants[product.id] || 0;
                const selectedVariant = product.list_product?.[selectedVariantIndex];
                const discount = selectedVariant
                  ? calculateDiscount(
                    selectedVariant.regular_price,
                    selectedVariant.sales_price
                  )
                  : 0;

                return (
                  <LinearGradient
                    colors={['#FFFFFF', '#FAFAFA']}
                    style={styles.productCard}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Product', {
                          product: product,
                        });
                      }}
                    >
                      <View style={styles.productImageContainer}>
                        <Image
                          source={{
                            uri: ApiService.getImageUrl(product.pro_image),
                          }}
                          style={styles.productImage}
                          resizeMode="contain"
                        />
                        {discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}%</Text>
                            <Text style={styles.discountOff}>OFF</Text>
                          </View>
                        )}
                        {selectedVariant?.available_stock === 0 && (
                          <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productDetails}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.eng_name}
                        </Text>

                        {selectedVariant && (
                          <>
                            <View style={styles.priceRow}>
                              <Text style={styles.currentPrice}>
                                ₹{selectedVariant.sales_price}
                              </Text>
                              {selectedVariant.regular_price !== selectedVariant.sales_price && (
                                <Text style={styles.originalPrice}>
                                  ₹{selectedVariant.regular_price}
                                </Text>
                              )}
                            </View>

                            {product.list_product && product.list_product.length > 1 && (
                              <TouchableOpacity
                                style={styles.sizeSelector}
                                onPress={() => {
                                  const nextVariant = (selectedVariantIndex + 1) % product.list_product.length;
                                  setSelectedVariants(prev => ({
                                    ...prev,
                                    [product.id]: nextVariant,
                                  }));
                                }}
                              >
                                <Text style={styles.sizeText}>
                                  {selectedVariant?.product_size || 'Select'}
                                </Text>
                                <Icon name="chevron-down" size={14} color="#666" />
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {selectedVariant && selectedVariant.available_stock > 0 && (
                      <View style={styles.featuredActionContainer}>
                        {selectedVariant.quantity > 0 ? (
                          <View style={styles.homeQuantityControl}>
                            <TouchableOpacity
                              onPress={() => updateQuantity(selectedVariant.id, Math.max(0, selectedVariant.quantity - 1))}
                              style={[styles.homeQuantityBtn, isInputFocused[selectedVariant.id] && { opacity: 0.5 }]}
                              disabled={isInputFocused[selectedVariant.id]}
                            >
                              <Icon name="minus" size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TextInput
                              style={styles.homeQuantityInput}
                              value={localQtys[selectedVariant.id] || selectedVariant.quantity.toString()}
                              keyboardType="numeric"
                              onChangeText={(text) => handleQtyInputChange(selectedVariant.id, text)}
                              onFocus={() => setIsInputFocused(prev => ({ ...prev, [selectedVariant.id]: true }))}
                              onBlur={() => setIsInputFocused(prev => ({ ...prev, [selectedVariant.id]: false }))}
                              onEndEditing={(e) => handleManualQuantity(selectedVariant.id, selectedVariant.quantity, e.nativeEvent.text)}
                              selectTextOnFocus={true}
                            />
                            <TouchableOpacity
                              onPress={() => updateQuantity(selectedVariant.id, selectedVariant.quantity + 1)}
                              style={[styles.homeQuantityBtn, styles.homeQuantityBtnPlus, isInputFocused[selectedVariant.id] && { opacity: 0.5 }]}
                              disabled={isInputFocused[selectedVariant.id]}
                            >
                              <Icon name="plus" size={14} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart(product)}
                          >
                            <LinearGradient
                              colors={[theme.colors.primary, '#6D4C41']}
                              style={styles.addButtonGradient}
                            >
                              <Icon name="plus" size={18} color="#fff" />
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </LinearGradient>
                );
              }}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            />
          </Animated.View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home" size={26} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.navIconWrapper}>
            <Icon name="cart-outline" size={26} color="#666" />
            {cartCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Icon name="package-variant" size={26} color="#666" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="cog-outline" size={26} color="#666" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  ) : mainContent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  headerGradient: {
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 0,
    fontWeight: '500',
  },
  cartButton: {
    marginLeft: 12,
  },
  cartIconWrapper: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 45,
  },
  searchInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 45,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: '#fff',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#fff',
  },
  quickActionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionGradient: {
    padding: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8D6E63',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryCard: {
    alignItems: 'center',
    width: 80,
  },
  categoryImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  categoryPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8D6E63',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  productsScroll: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24, // Space for shadow
  },
  productCard: {
    width: 170,
    borderRadius: 20,
    overflow: 'visible', // Allow shadow to show
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#fff', // White background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  discountOff: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#8D6E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredActionContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    left: 8,
    alignItems: 'flex-end',
  },
  homeQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    height: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  homeQuantityBtn: {
    width: 30,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  homeQuantityBtnPlus: {
    backgroundColor: '#8D6E63',
  },
  homeQuantityInput: {
    paddingHorizontal: 5,
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
    paddingVertical: 0,
    height: '100%',
  },
  bottomSpace: {
    height: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIconWrapper: {
    position: 'relative',
  },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 180, // High enough to cover main content but below search bar
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 5,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  closeBtn: {
    color: '#8D6E63',
    fontWeight: '700',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  resultDetails: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  resultPrice: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '700',
  },
  emptyResults: {
    padding: 30,
    alignItems: 'center',
  },
  emptyResultsText: {
    color: '#999',
  },
});

export default HomeScreen;
