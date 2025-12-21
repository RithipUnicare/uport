import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, List, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Contact Us" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          Get in Touch
        </Text>
        <List.Item
          title="Email"
          description="support@uport.in"
          left={props => <List.Icon {...props} icon="email" />}
          onPress={() => Linking.openURL('mailto:support@uport.in')}
        />
        <List.Item
          title="Phone"
          description="+91 1234567890"
          left={props => <List.Icon {...props} icon="phone" />}
          onPress={() => Linking.openURL('tel:+911234567890')}
        />
        <List.Item
          title="Address"
          description="Vellore, Tamil Nadu, India"
          left={props => <List.Icon {...props} icon="map-marker" />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 10 },
  title: { padding: 15, fontWeight: 'bold' },
});

export default ContactUsScreen;
