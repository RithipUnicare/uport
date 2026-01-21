import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StorageService } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width } = Dimensions.get('window');

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const theme = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        startAnimations();
        checkAuthAndNavigate();
    }, []);

    const startAnimations = () => {
        // Logo scale and fade in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Rotate animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Text slide up
        Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 800,
            delay: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const checkAuthAndNavigate = async () => {
        try {
            // Wait for animations to complete
            await new Promise<void>(resolve => setTimeout(() => resolve(), 2500));

            const token = await StorageService.getItem('auth_token');

            if (token) {
                navigation.replace('Home');
            } else {
                navigation.replace('Login');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            navigation.replace('Login');
        }
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={[theme.colors.primary, '#8B1538', '#6B0F2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Animated Background Circles */}
            <Animated.View
                style={[
                    styles.backgroundCircle,
                    styles.circle1,
                    {
                        transform: [{ rotate: spin }],
                        opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.1],
                        }),
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.backgroundCircle,
                    styles.circle2,
                    {
                        transform: [{ rotate: spin }],
                        opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.15],
                        }),
                    },
                ]}
            />

            {/* Main Content */}
            <View style={styles.content}>
                {/* Logo Container */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { scale: pulseAnim },
                            ],
                        },
                    ]}
                >
                    <View style={styles.logoCircle}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F0F0F0']}
                            style={styles.logoGradient}
                        >
                            <Icon name="cart" size={80} color={theme.colors.primary} />
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* App Name */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }],
                        },
                    ]}
                >
                    <Text style={styles.appName}>ROUTE GADI</Text>
                    <Text style={styles.tagline}>Grocery Store</Text>
                    <Text style={styles.subtitle}>Fresh • Fast • Convenient</Text>
                </Animated.View>

                {/* Loading Indicator */}
                <Animated.View
                    style={[
                        styles.loadingContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <View style={styles.loadingBar}>
                        <Animated.View
                            style={[
                                styles.loadingProgress,
                                {
                                    transform: [{ scaleX: pulseAnim }],
                                },
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
                style={[
                    styles.footer,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            >
                <Text style={styles.footerText}>Powered by SMD</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: '#fff',
    },
    circle1: {
        width: width * 1.5,
        height: width * 1.5,
        top: -width * 0.5,
        right: -width * 0.3,
    },
    circle2: {
        width: width * 1.2,
        height: width * 1.2,
        bottom: -width * 0.4,
        left: -width * 0.2,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    logoGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    appName: {
        fontSize: 56,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
    },
    tagline: {
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
        letterSpacing: 2,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 1,
    },
    loadingContainer: {
        width: 200,
        alignItems: 'center',
    },
    loadingBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingProgress: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    version: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default SplashScreen;
