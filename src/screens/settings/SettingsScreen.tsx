import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  List,
  Text,
  Switch,
  Divider,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Settings" color="#fff" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.sectionHeader}>
          PREFERENCES
        </Text>
        <List.Section style={styles.listSection}>
          <List.Item
            title="Push Notifications"
            titleStyle={styles.listTitle}
            description="Receive notifications about orders and offers"
            descriptionStyle={styles.listDescription}
            left={props => (
              <List.Icon
                {...props}
                icon="bell-outline"
                color={theme.colors.primary}
              />
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
          <Divider style={styles.divider} />
          <List.Item
            title="App Version"
            titleStyle={styles.listTitle}
            description="1.0.41"
            descriptionStyle={styles.listDescription}
            left={props => (
              <List.Icon {...props} icon="information-outline" color="#666" />
            )}
            style={styles.listItem}
          />
        </List.Section>
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
    padding: 16,
  },
  sectionHeader: {
    color: '#666',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  listSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItem: {
    paddingVertical: 8,
  },
  listTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listDescription: {
    fontSize: 13,
  },
  divider: {
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
});

export default SettingsScreen;
