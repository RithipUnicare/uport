import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsAndConditions'>;

const TermsAndConditionsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Terms & Conditions" color="#fff" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            1. General
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            www.routegadi.in (hereinafter, the "app") is owned and operated by
            Routegadi. You are advised to read and understand these Terms
            carefully as they govern your use of the application and its
            services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            2. About Us
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Buy grocery and household essentials online from Routegadi at the
            best prices and get them delivered directly to your doorstep with
            our reliable delivery service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            3. Services Overview
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Our online grocery services can be accessed through this mobile
            application. We strive to maintain accurate product descriptions and
            pricing at all times.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            4. Registration
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            While browsing might be possible, you must create an account to use
            the majority of services/features, especially for placing and
            tracking orders.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            5. Payment
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Currently, we primarily offer Cash on Delivery (COD) for your
            convenience. Payment must be made in full at the time of delivery.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text variant="bodyMedium" style={styles.infoText}>
            For the complete and most up-to-date terms and conditions, please
            visit our website or contact our customer support team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
  },
  infoText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default TermsAndConditionsScreen;
