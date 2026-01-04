import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, List, Text, Divider, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Contact Us" color="#fff" />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text variant="headlineMedium" style={styles.title}>
            Get in Touch
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            We're here to help! Reach out to us through any of these channels
            and we'll respond as soon as possible.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <List.Item
            title="Email"
            description="support@routegadi.in"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={props => (
              <View
                style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}
              >
                <List.Icon {...props} icon="email-outline" color="#2196f3" />
              </View>
            )}
            onPress={() => Linking.openURL('mailto:support@routegadi.in')}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Phone"
            description="+91 1234567890"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={props => (
              <View
                style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}
              >
                <List.Icon {...props} icon="phone-outline" color="#4caf50" />
              </View>
            )}
            onPress={() => Linking.openURL('tel:+911234567890')}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Address"
            description="Vellore, Tamil Nadu, India"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={props => (
              <View
                style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}
              >
                <List.Icon
                  {...props}
                  icon="map-marker-outline"
                  color="#ff9800"
                />
              </View>
            )}
            style={styles.listItem}
          />
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM
          </Text>
          <Text style={styles.footerSubtext}>
            We typically respond within 24 hours
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#666',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 24,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: 16,
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  divider: {
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  footerSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ContactUsScreen;
