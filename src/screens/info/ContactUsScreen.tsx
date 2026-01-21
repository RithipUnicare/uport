import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { List, Text, Divider, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import GradientHeader from '../../components/GradientHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Contact Us"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              title="Address"
              description={`Demo Address`}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              descriptionNumberOfLines={4}
              left={props => (
                <View
                  style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}
                >
                  <Icon name="map-marker" size={28} color="#FF9800" />
                </View>
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />

            <List.Item
              title="Phone"
              description="8553708392"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View
                  style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}
                >
                  <Icon name="phone" size={28} color="#4CAF50" />
                </View>
              )}
              onPress={() => Linking.openURL('tel:8553708392')}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />

            <List.Item
              title="Email"
              description="support@routegadi.in"
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              left={props => (
                <View
                  style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}
                >
                  <Icon name="email" size={28} color="#2196F3" />
                </View>
              )}
              onPress={() => Linking.openURL('mailto:support@routegadi.in')}
              style={styles.listItem}
            />
          </View>

          <View style={styles.footerSection}>
            <Icon name="clock-outline" size={24} color={theme.colors.primary} style={styles.footerIcon} />
            <Text style={styles.footerText}>
              Business Hours
            </Text>
            <Text style={styles.footerSubtext}>
              Monday - Saturday, 9:00 AM - 6:00 PM
            </Text>
            <Text style={styles.responseTime}>
              We typically respond within 24 hours
            </Text>
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
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#666',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 20,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    fontSize: 16,
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  divider: {
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  footerSection: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  footerIcon: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ContactUsScreen;
