import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsAndConditions'>;

const TermsAndConditionsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Terms & Conditions" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          1. General
        </Text>
        <Text style={styles.paragraph}>
          www.uport.in (hereinafter, the "app") is owned and operated by Uport.
          You are advised to read and understand these Terms carefully.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          2. About Us
        </Text>
        <Text style={styles.paragraph}>
          Buy grocery and household essentials online from Uport at best prices
          and get them delivered at your doorstep.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          3. Services Overview
        </Text>
        <Text style={styles.paragraph}>
          The online grocery services may be accessed through mobile
          application.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          4. Registration
        </Text>
        <Text style={styles.paragraph}>
          It is not compulsory to register on the app. However, to use the
          majority of services/features, you must create an account.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          5. Payment
        </Text>
        <Text style={styles.paragraph}>Only cash on delivery available.</Text>

        <Text style={styles.paragraph}>
          For complete terms and conditions, please visit our website or contact
          customer support.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 15 },
  sectionTitle: { fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  paragraph: { marginBottom: 10, lineHeight: 20, color: '#333' },
});

export default TermsAndConditionsScreen;
