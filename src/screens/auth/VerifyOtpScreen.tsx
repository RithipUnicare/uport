import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              We sent OTP code to your mobile number
            </Text>
            <Text style={styles.mobileNumber}>{registerData.mobile}</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Display the OTP from API */}
            <Card style={styles.otpCard}>
              <Card.Content>
                <Text style={styles.otpLabel}>Your OTP Code:</Text>
                <Text style={styles.otpDisplay}>{otp}</Text>
                <Text style={styles.otpNote}>
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
                <Text style={styles.resendLink}>Go Back</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#b90617',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  mobileNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
  },
  otpCard: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  otpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  otpDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b90617',
    textAlign: 'center',
    letterSpacing: 10,
    marginVertical: 10,
  },
  otpNote: {
    fontSize: 12,
    color: '#999',
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
    color: '#b90617',
    fontWeight: 'bold',
  },
});

export default VerifyOtpScreen;
