import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  List,
  Text,
  Divider,
  Button,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuthService from '../../services/auth.service';
import { CommonActions } from '@react-navigation/native';
import { StorageService } from '../../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await AuthService.getCurrentUser();
    setUserName(user.name || 'User');
    setUserType(user.user_type === '2' ? 'B2B Customer' : 'Customer');
  };

  const handleLogout = async () => {
    await AuthService.logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
    StorageService.removeItem('user_id');
    StorageService.removeItem('user_type');
    StorageService.removeItem('user_name');
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Account" />
      </Appbar.Header>

      <ScrollView>
        <View style={styles.header}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text variant="titleLarge" style={styles.name}>
            {userName}
          </Text>
          <Text variant="bodyMedium" style={styles.userType}>
            {userType}
          </Text>
        </View>

        <Divider />

        <List.Section>
          <List.Item
            title="My Orders"
            left={props => <List.Icon {...props} icon="shopping" />}
            onPress={() => navigation.navigate('MyOrders')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
            onPress={() => navigation.navigate('ChangePassword')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => navigation.navigate('Settings')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Contact Us"
            left={props => <List.Icon {...props} icon="phone" />}
            onPress={() => navigation.navigate('ContactUs')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Terms & Conditions"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => navigation.navigate('TermsAndConditions')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-check" />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 30, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontWeight: 'bold' },
  userType: { color: '#666', marginTop: 5 },
  buttonContainer: { padding: 20 },
  logoutButton: { height: 50 },
});

export default ProfileScreen;
