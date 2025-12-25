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
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuthService from '../../services/auth.service';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

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

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const response: any = await AuthService.getAreas();
      if (response.status === 1 && response.products) {
        setAreas(response.products);
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
      const response = await AuthService.register({
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
          text1: 'Registration Successful',
          text2: response.message || 'You can now login',
        });
        navigation.replace('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Please try again',
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
            <Text style={styles.title}>Register</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {/* <View style={styles.logoContainer}>
              <View
                style={[styles.logo, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.logoText}>UPORT</Text>
              </View>
            </View> */}
            <Text style={styles.subtitle}>
              Your number and other details are safe with us
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
              mode="outlined"
              style={styles.input}
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
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Landmark"
              value={landmark}
              onChangeText={setLandmark}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Your Area</Text>
              <Picker
                selectedValue={area}
                onValueChange={setArea}
                style={styles.picker}
              >
                <Picker.Item label="Select Your area" value="" />
                {areas.map((item: any) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id.toString()}
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Sign up
            </Button>
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
    fontSize: 20,
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
  logoContainer: {
    marginVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  button: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
});

export default RegisterScreen;
