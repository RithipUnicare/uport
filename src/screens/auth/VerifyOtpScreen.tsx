import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  useTheme,
  Card,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuthService from '../../services/auth.service';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOtp'>;

const VerifyOtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { otp, registerData } = route.params;

  const [loading, setLoading] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleVerifyOtp = async () => {
    // Validation
    if (!enteredOtp || enteredOtp.length !== 4) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter valid 4-digit OTP',
      });
      return;
    }

    // Match the entered OTP with the OTP from API
    if (enteredOtp !== otp.toString()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'The OTP you entered does not match. Please try again.',
      });
      return;
    }

    setLoading(true);

    try {
      // OTP matched, now complete the registration
      const registerResponse = await AuthService.registerB2BUser({
        name: registerData.name,
        mobile: registerData.mobile,
        password: registerData.password,
        email: registerData.email,
        area_id: registerData.area_id,
      });

      if (registerResponse.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'You can now login with your credentials',
        });
        navigation.replace('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: registerResponse.message || 'Please try again',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Registration failed. Please try again.',
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.title, { color: theme.colors.onPrimary }]}>Verify OTP</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.closeText, { color: theme.colors.onPrimary }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
              We sent OTP code to your mobile number
            </Text>
            <Text style={[styles.mobileNumber, { color: theme.colors.onPrimary }]}>{registerData.mobile}</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { transform: [{ translateY: slideAnim }] }]}>
            {/* Display the OTP from API */}
            <Card style={[styles.otpCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.otpLabel, { color: theme.colors.onSurface }]}>Your OTP Code:</Text>
                <Text style={[styles.otpDisplay, { color: theme.colors.primary }]}>{otp}</Text>
                <Text style={[styles.otpNote, { color: theme.colors.onSurfaceVariant || '#999' }]}>
                  (For testing purposes, the OTP is shown above)
                </Text>
              </Card.Content>
            </Card>

            <TextInput
              label="Enter OTP"
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              keyboardType="number-pad"
              maxLength={4}
              mode="outlined"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Verify & Register
            </Button>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.resendContainer}
            >
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text style={[styles.resendLink, { color: theme.colors.primary }]}>Go Back</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
  },
  header: {
    // backgroundColor will be set via theme
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set via theme
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeText: {
    // color will be set via theme
    fontSize: 24,
  },
  subtitle: {
    // color will be set via theme
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  mobileNumber: {
    // color will be set via theme
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
  },
  otpCard: {
    marginBottom: 20,
    // backgroundColor will be set via theme
  },
  otpLabel: {
    fontSize: 14,
    // color will be set via theme
    marginBottom: 5,
  },
  otpDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    // color will be set via theme
    textAlign: 'center',
    letterSpacing: 10,
    marginVertical: 10,
  },
  otpNote: {
    fontSize: 12,
    // color will be set via theme
    textAlign: 'center',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    // color will be set via theme
    fontWeight: 'bold',
  },
});

export default VerifyOtpScreen;
