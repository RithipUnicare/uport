import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import GradientHeader from '../../components/GradientHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Privacy Policy"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Information Collection
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We collect information you provide directly to us when you create an
            account, place orders, or contact customer support. This may include
            your name, email address, phone number, and delivery address.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Use of Information
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We use the information we collect to process orders, communicate
            with you about your purchases, and improve our services to provide a
            better shopping experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Information Security
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, or disclosure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Contact Us
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            If you have questions about this Privacy Policy or how we handle
            your data, please contact our support team at{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              support@routegadi.in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  paragraph: {
    lineHeight: 24,
    color: '#444',
  },
});

export default PrivacyPolicyScreen;
