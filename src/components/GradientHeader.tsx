import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GradientHeaderProps {
    title: string;
    subtitle?: string;
    onBackPress?: () => void;
    onCartPress?: () => void;
    cartCount?: number;
    showCart?: boolean;
    showBack?: boolean;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({
    title,
    subtitle,
    onBackPress,
    onCartPress,
    cartCount = 0,
    showCart = false,
    showBack = false,
}) => {
    const theme = useTheme();

    return (
        <LinearGradient
            colors={[theme.colors.primary, '#8B1538']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
        >
            <SafeAreaView edges={['top']}>
                <View style={styles.headerContent}>
                    {showBack ? (
                        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                            <Icon name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.backButton} />
                    )}

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{title}</Text>
                        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
                    </View>

                    {showCart ? (
                        <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                            <View style={styles.cartIconWrapper}>
                                <Icon name="cart-outline" size={26} color="#fff" />
                                {cartCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.cartButton} />
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
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
    cartButton: {
        marginLeft: 12,
        width: 40,
        height: 40,
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
});

export default GradientHeader;
