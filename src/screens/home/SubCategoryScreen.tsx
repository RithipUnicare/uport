import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  Badge,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';

type Props = NativeStackScreenProps<RootStackParamList, 'SubCategory'>;

const SubCategoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubcategories();
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    const count = await CartService.getCartCount();
    setCartCount(count);
  };

  const loadSubcategories = async () => {
    try {
      const response = await ProductService.getSubCategories(categoryId);
      if (response.status === 1 && response.subcategories) {
        // Construct full image URLs using the image_url base path
        const subcategoriesWithImages = response.subcategories.map(subcat => ({
          ...subcat,
          image: response.image_url + subcat.image,
        }));
        setSubcategories(subcategoriesWithImages);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title={categoryName} color="#fff" />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="cart" color="#fff" />
            {cartCount > 0 && <Badge style={styles.badge}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search For Products, Brands And More..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => {
            if (searchQuery.trim()) {
              navigation.navigate('Product', { searchQuery: searchQuery.trim() });
            }
          }}
          onIconPress={() => {
            if (searchQuery.trim()) {
              navigation.navigate('Product', { searchQuery: searchQuery.trim() });
            }
          }}
          style={styles.searchBar}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {subcategories.map(subcategory => (
            <TouchableOpacity
              key={subcategory.id}
              onPress={() =>
                navigation.navigate('Product', {
                  subcategoryId: subcategory.id,
                  subcategoryName: subcategory.name,
                })
              }
            >
              <Card style={styles.subcategoryCard}>
                <View style={styles.cardContent}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.title}>
                      {subcategory.name}
                    </Text>
                    <Text style={styles.description}>
                      {subcategory.short_desc || 'Best offer applicable'}
                    </Text>
                  </View>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: subcategory.image,
                      }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {subcategories.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text>No categories available</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subcategoryCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: 16,
  },
  description: {
    color: '#4caf50',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    padding: 40,
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

export default SubCategoryScreen;
