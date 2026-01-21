import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  List,
  Text,
  Switch,
  Divider,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import GradientHeader from '../../components/GradientHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    await AuthService.logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Settings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Account Section */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            ACCOUNT
          </Text>
          <View style={styles.listSection}>
            <List.Item
              title="Profile"
              description="Manage your account details"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Icon name="account" size={24} color="#2196F3" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#999" />}
              onPress={() => navigation.navigate('Profile')}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Change Password"
              description="Update your password"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Icon name="lock" size={24} color="#FF9800" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#999" />}
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.listItem}
            />
          </View>

          {/* Preferences Section */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            PREFERENCES
          </Text>
          <View style={styles.listSection}>
            <List.Item
              title="Push Notifications"
              description="Receive notifications about orders and offers"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="bell" size={24} color="#4CAF50" />
                </View>
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </View>

          {/* Support Section */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            SUPPORT
          </Text>
          <View style={styles.listSection}>
            <List.Item
              title="Contact Us"
              description="Get in touch with our support team"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="email" size={24} color="#9C27B0" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#999" />}
              onPress={() => navigation.navigate('ContactUs')}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Terms & Conditions"
              description="Read our terms of service"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#FFF9C4' }]}>
                  <Icon name="file-document" size={24} color="#F57F17" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#999" />}
              onPress={() => navigation.navigate('TermsAndConditions')}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Privacy Policy"
              description="Learn how we protect your data"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                  <Icon name="shield-check" size={24} color="#00897B" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#999" />}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              style={styles.listItem}
            />
          </View>

          {/* About Section */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            ABOUT
          </Text>
          <View style={styles.listSection}>
            <List.Item
              title="App Version"
              description="1.0.41"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#F5F5F5' }]}>
                  <Icon name="information" size={24} color="#666" />
                </View>
              )}
              style={styles.listItem}
            />
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <List.Item
              title="Logout"
              titleStyle={[styles.listTitle, { color: '#d32f2f' }]}
              left={props => (
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Icon name="logout" size={24} color="#d32f2f" />
                </View>
              )}
              right={props => <Icon name="chevron-right" size={24} color="#d32f2f" />}
              onPress={handleLogout}
              style={styles.listItem}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#666',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 20,
    paddingLeft: 4,
  },
  listSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    fontSize: 15,
  },
  listDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  divider: {
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  logoutSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
});

export default SettingsScreen;
