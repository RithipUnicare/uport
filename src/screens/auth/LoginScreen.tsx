import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  useTheme,
  Card,
  Title,
  IconButton,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuthService from '../../services/auth.service';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const groceryFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts with staggered timing
    const animations = [
      // Logo scale animation
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      // Header fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      // Card slide up and scale
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Grocery icons fade in
      Animated.timing(groceryFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(100, animations).start();
  }, [fadeAnim, slideAnim, scaleAnim, logoScaleAnim, groceryFadeAnim]);

  const handleLogin = async () => {
    // Validation
    if (!mobile || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter mobile number and password',
      });
      return;
    }

    if (mobile.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit mobile number',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.login({
        mobile,
        password,
      });

      if (response.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful!',
        });

        // Navigate to Home screen
        navigation.replace('Home');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response.message || 'Invalid credentials',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to login. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>ROUTE GADI</Title>

            <View style={styles.logoContainer}>
              <Animated.View style={[styles.logoBackground, { transform: [{ scale: logoScaleAnim }], backgroundColor: theme.colors.primary }]}>
                <IconButton
                  icon="store"
                  size={40}
                  iconColor={theme.colors.onPrimary}
                  style={styles.logoIcon}
                />
              </Animated.View>
              <View style={styles.logoGlow} />
            </View>

            <Text style={[styles.subtitle, { color: theme.colors.onBackground }]}>
              Fresh Groceries Delivered
            </Text>

            {/* Grocery items showcase */}
            <Animated.View style={[styles.groceryShowcase, { opacity: groceryFadeAnim }]}>
              <View style={[styles.groceryItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                <IconButton icon="food-apple" size={20} iconColor={theme.colors.secondary} />
              </View>
              <View style={[styles.groceryItem, { backgroundColor: theme.colors.primaryContainer }]}>
                <IconButton icon="fruit-grapes" size={20} iconColor={theme.colors.primary} />
              </View>
              <View style={[styles.groceryItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                <IconButton icon="basket" size={20} iconColor={theme.colors.secondary} />
              </View>
              <View style={[styles.groceryItem, { backgroundColor: theme.colors.primaryContainer }]}>
                <IconButton icon="shopping" size={20} iconColor={theme.colors.primary} />
              </View>
              <View style={[styles.groceryItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                <IconButton icon="storefront" size={20} iconColor={theme.colors.secondary} />
              </View>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.cardContainer, {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }]}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.welcomeSection}>
                  <IconButton
                    icon="account-circle"
                    size={32}
                    iconColor={theme.colors.primary}
                    style={styles.welcomeIcon}
                  />
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Welcome Back!
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Login to your grocery account
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <TextInput
                    label="Mobile Number"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="phone" />}
                    theme={{ roundness: 12 }}
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    theme={{ roundness: 12 }}
                  />
                </View>

                <View style={styles.buttonSection}>
                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon="login"
                  >
                    Login to Shop
                  </Button>
                </View>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                </View>

                <View style={styles.signupSection}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    style={styles.signupButton}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.signupText, { color: theme.colors.primary }]}>
                      New User? Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set via theme
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingTop: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 0,
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  logoBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    margin: 0,
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    top: -5,
    left: -5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set via theme
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    // color will be set via theme
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  groceryShowcase: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  groceryItem: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    // backgroundColor will be set via theme
  },
  cardContent: {
    padding: 20,
    paddingBottom: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeIcon: {
    margin: 0,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    // color will be set via theme
  },
  cardSubtitle: {
    fontSize: 14,
    // color will be set via theme
    textAlign: 'center',
    marginBottom: 8,
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonSection: {
    marginBottom: 16,
  },
  loginButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 52,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signupSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
});

export default LoginScreen;
