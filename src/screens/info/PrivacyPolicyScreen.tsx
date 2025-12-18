import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Privacy Policy" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Information Collection
        </Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us when you create an
          account, place orders, or contact customer support.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Use of Information
        </Text>
        <Text style={styles.paragraph}>
          We use the information we collect to process orders, communicate with
          you, and improve our services.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Information Security
        </Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal
          information.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Contact
        </Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at
          support@uport.in
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

export default PrivacyPolicyScreen;
