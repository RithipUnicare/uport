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
      if (response.status === 1 && response.result?.subcategories) {
        setSubcategories(response.result.subcategories);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={categoryName} />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
            <Appbar.Action icon="shopping-cart" color="#fff" />
            {cartCount > 0 && <Badge style={styles.badge}>{cartCount}</Badge>}
          </View>
        </TouchableOpacity>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search For Products, Brands And More..."
          onChangeText={setSearchQuery}
          value={searchQuery}
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
                <Card.Content style={styles.cardContent}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.title}>
                      {subcategory.name}
                    </Text>
                    <Text style={styles.description}>
                      {subcategory.short_desc || 'Best offer applicable'}
                    </Text>
                  </View>
                  <Image
                    source={{
                      uri: `https://uports.in/admin${subcategory.image}`,
                    }}
                    style={styles.image}
                  />
                </Card.Content>
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
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  subcategoryCard: {
    margin: 10,
    marginBottom: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 100,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    color: '#4caf50',
    marginTop: 5,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 8,
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

export default SubCategoryScreen;
