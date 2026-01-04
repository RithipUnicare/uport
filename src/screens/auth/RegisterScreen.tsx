import React, { useState, useEffect } from 'react';
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
  Title,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuthService from '../../services/auth.service';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [areas, setAreas] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const response: any = await AuthService.getAreas();
      if (response.status === 1 && response.products) {
        // Map the API response to the format expected by Dropdown
        const formattedAreas = response.products.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setAreas(formattedAreas);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (
      !name ||
      !mobile ||
      !password ||
      !email ||
      !companyName ||
      !landmark ||
      !area ||
      !address
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
      });
      return;
    }

    if (mobile.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter valid 10-digit mobile number',
      });
      return;
    }

    setLoading(true);

    try {
      const response: any = await AuthService.register({
        name,
        mobile,
        password,
        email,
        company_name: companyName,
        landmark,
        area_id: area,
        address,
      });

      if (response.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: response.message || 'We sent OTP code to your mobile.',
        });

        // Navigate to VerifyOtpScreen with OTP and registration data
        navigation.navigate('VerifyOtp', {
          otp: response.otp,
          registerData: {
            name,
            mobile,
            password,
            email,
            area_id: area,
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: response.message || 'Please try again',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please try again.',
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
            <Title style={styles.headerTitle}>Create Account</Title>
            <Text style={styles.headerSubtitle}>Sign up to get started</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <Card style={styles.card}>
              <Card.Content>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <TextInput
                  label="Mobile Number"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <TextInput
                  label="Create Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  theme={{ roundness: 10 }}
                />

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <TextInput
                  label="Company Name"
                  value={companyName}
                  onChangeText={setCompanyName}
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <TextInput
                  label="Landmark"
                  value={landmark}
                  onChangeText={setLandmark}
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <View style={styles.dropdownContainer}>
                  <Text style={styles.label}>Select Your Area</Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && { borderColor: theme.colors.primary },
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={areas}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select area' : '...'}
                    searchPlaceholder="Search..."
                    value={area}
                    mode="modal"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      setArea(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>

                <TextInput
                  label="Address"
                  value={address}
                  onChangeText={setAddress}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  theme={{ roundness: 10 }}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Sign up
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b90617',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  closeText: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  dropdown: {
    height: 50,
    borderColor: '#79747E', // Outlined input border color
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#49454F',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#1C1B1F',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
