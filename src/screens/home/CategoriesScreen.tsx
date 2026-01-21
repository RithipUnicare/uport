import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Text,
    ActivityIndicator,
    Searchbar,
    useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ProductService from '../../services/product.service';
import ApiService from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3;

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [searchQuery, categories]);

    const loadCategories = async () => {
        try {
            const response = await ProductService.getCategories();
            if (response.status === 1 && response.categories) {
                setCategories(response.categories);
                setFilteredCategories(response.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCategoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
                navigation.navigate('SubCategory', {
                    categoryId: item.id,
                    categoryName: item.name,
                })
            }
        >
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.imageContainer}
            >
                {item.image ? (
                    <Image
                        source={{ uri: ApiService.getImageUrl(item.image) }}
                        style={styles.categoryImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </LinearGradient>
            <Text style={styles.categoryName} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
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
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>All Categories</Text>
                            <Text style={styles.headerSubtitle}>Explore by department</Text>
                        </View>
                    </View>

                    <View style={styles.searchSection}>
                        <Searchbar
                            placeholder="Search categories..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                            iconColor="#666"
                            inputStyle={styles.searchInput}
                            placeholderTextColor="#999"
                        />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Fetching categories...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="tag-off-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No categories found</Text>
                        </View>
                    }
                />
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
        paddingBottom: 20,
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
    headerTextContainer: {
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    searchSection: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    searchBar: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        height: 46,
    },
    searchInput: {
        fontSize: 14,
        minHeight: 0,
    },
    gridContent: {
        padding: 12,
        paddingBottom: 40,
    },
    categoryCard: {
        width: itemWidth,
        marginBottom: 20,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    imageContainer: {
        width: itemWidth - 10,
        height: itemWidth - 10,
        borderRadius: (itemWidth - 10) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: '#fff',
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
});

export default CategoriesScreen;
