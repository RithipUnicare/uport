import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
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
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    loadUserData();
    loadHomeData();
    loadCartCount();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

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
      const [bannersRes, categoriesRes] = await Promise.all([
        ProductService.getBanners(parseInt(userType)),
        ProductService.getCategories(),
      ]);
      if (bannersRes.status === 1 && bannersRes.sliders) {
        setBanners(
          bannersRes.sliders.map(s => bannersRes.image_url + s.slider),
        );
      }

      // GetCategoryBB returns a plain array
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
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Routegadi - B2B" color="#fff" />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="cart" color="#fff" />
            {cartCount > 0 && <Badge style={styles.badge}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>

      {/* <View
        style={[
          styles.welcomeBanner,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={styles.welcomeText}>
          Welcome to B2B{userName ? ` - ${userName}` : ''}
        </Text>
      </View> */}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search For Products, Brands And More..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: `${BASE_URL}${banners[currentBannerIndex]}` }}
              style={styles.bannerImage}
              resizeMode="center"
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

        <View style={styles.sectionTitleContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What Would You Like To Shop?
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
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
                    style={[
                      styles.categoryImage,
                      {
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text style={{ color: '#999', fontSize: 10 }}>
                      No Image
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            My Options
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          <Card style={styles.optionCard} onPress={handleUploadList}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('../../../cordova-source/img/list.png')}
                  style={styles.optionIcon}
                />
              </View>
              <View style={styles.optionText}>
                <Text
                  variant="titleMedium"
                  style={{ color: '#1a1a1a', fontWeight: 'bold' }}
                >
                  Upload Grocery List
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>
                  Camera/Gallery
                </Text>
              </View>
              <Appbar.Action icon="chevron-right" color="#ccc" />
            </View>
          </Card>

          <Card
            style={styles.optionCard}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: '#e3f2fd' },
                ]}
              >
                <MaterialCommunityIcons
                  name="shopping-outline"
                  size={24}
                  color="#2196f3"
                />
              </View>
              <View style={styles.optionText}>
                <Text
                  variant="titleMedium"
                  style={{ color: '#1a1a1a', fontWeight: 'bold' }}
                >
                  My Orders
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>
                  Reorder/Return
                </Text>
              </View>
              <Appbar.Action icon="chevron-right" color="#ccc" />
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Appbar.Action icon="account" color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Appbar.Action icon="cog" color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Appbar.Action icon="phone" color="#666" />
        </TouchableOpacity>
      </View>
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
  welcomeBanner: {
    padding: 10,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    borderRadius: 28,
    elevation: 2,
    backgroundColor: '#f8f9fa',
    height: 48,
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 16,
    backgroundColor: '#fff',
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 40) / 3,
    marginVertical: 8,
    alignItems: 'center',
  },
  categoryImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    elevation: 2,
    padding: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  optionsGrid: {
    padding: 16,
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 28,
    height: 28,
  },
  optionText: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 8,
    height: 60,
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
    backgroundColor: '#4caf50',
    fontSize: 10,
    height: 18,
    minWidth: 18,
  },
});

export default HomeScreen;
