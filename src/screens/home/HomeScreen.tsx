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
import { StorageService } from '../../utils/storage';
import CameraService from '../../services/camera.service';
import Toast from 'react-native-toast-message';

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

      if (categoriesRes.status === 1 && categoriesRes.categories) {
        setCategories(categoriesRes.categories);
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
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Uport - B2B" />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="shopping-cart" color="#fff" />
            {cartCount > 0 && <Badge style={styles.badge}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>

      <View
        style={[
          styles.welcomeBanner,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={styles.welcomeText}>
          Welcome to B2B{userName ? ` - ${userName}` : ''}
        </Text>
      </View>

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
              source={{ uri: banners[currentBannerIndex] }}
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

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              What Would You Like To Shop?
            </Text>
          </Card.Content>
        </Card>

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
              <Image
                source={{ uri: `https://uports.in/admin${category.image}` }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              My Options?
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.optionCard} onPress={handleUploadList}>
          <Card.Content style={styles.optionContent}>
            <Image
              source={require('../../../cordova-source/img/list.png')}
              style={styles.optionIcon}
            />
            <View style={styles.optionText}>
              <Text
                variant="titleMedium"
                style={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                Upload Grocery List
              </Text>
              <Text variant="bodySmall">Camera/Gallery</Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={styles.optionCard}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Card.Content style={styles.optionContent}>
            <Image
              source={require('../../../cordova-source/img/shopping-bag.svg')}
              style={styles.optionIcon}
            />
            <View style={styles.optionText}>
              <Text
                variant="titleMedium"
                style={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                My Orders
              </Text>
              <Text variant="bodySmall">Reorder/Return</Text>
            </View>
          </Card.Content>
        </Card>
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
  welcomeBanner: {
    padding: 10,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
  },
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    borderRadius: 10,
  },
  bannerContainer: {
    height: 200,
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  indicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#b90617',
  },
  sectionCard: {
    margin: 10,
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: width / 2 - 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  optionCard: {
    margin: 10,
    marginBottom: 5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    flex: 1,
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

export default HomeScreen;
