import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { wipeAllData } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    decoyMode,
    toggleDecoyMode,
    wipeAllData: wipeLocalData,
    setPIN,
    anonymousId,
  } = useAppContext();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleQuickExit = () => {
    Alert.alert(
      'Quick Exit',
      'This will close the app immediately. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would close the app
            // For React Native, you might need a native module
            Alert.alert('App Closed', 'The app has been closed.');
          },
        },
      ]
    );
  };

  const handleSetPIN = () => {
    // Navigate to PIN setup screen
    Alert.prompt(
      'Set PIN',
      'Enter a 4-6 digit PIN to lock the app',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: async (pin) => {
            if (pin && pin.length >= 4) {
              await setPIN(pin);
              Alert.alert('Success', 'PIN set successfully');
            } else {
              Alert.alert('Error', 'PIN must be at least 4 digits');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleWipeData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including safety plans, evidence, and chat history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Wipe server data
              await wipeAllData(anonymousId);
              // Wipe local data
              await wipeLocalData();
              Alert.alert('Success', 'All data has been deleted');
            } catch (error) {
              console.error('Wipe data error:', error);
              Alert.alert('Error', 'Failed to delete all data');
            }
          },
        },
      ]
    );
  };

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  };

  const handleBiometricToggle = async (value) => {
    const supported = await checkBiometricSupport();
    if (value && !supported) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }
    setBiometricEnabled(value);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={theme.colors.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <SettingItem
            icon="lock"
            title="App PIN"
            subtitle="Lock the app with a PIN"
            onPress={handleSetPIN}
          />
          <SettingItem
            icon="fingerprint"
            title="Biometric Lock"
            subtitle="Use fingerprint or face ID"
            rightComponent={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="eye-off"
            title="Decoy Mode"
            subtitle="Hide the app's true purpose"
            rightComponent={
              <Switch
                value={decoyMode}
                onValueChange={toggleDecoyMode}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
            showArrow={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="bell"
            title="Push Notifications"
            subtitle="Receive important updates"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
            showArrow={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <SettingItem
            icon="translate"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Language', 'Language selection coming soon')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="shield-check"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content...')}
          />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help using the app"
            onPress={() => Alert.alert('Help', 'Help content...')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency</Text>
          <SettingItem
            icon="exit-run"
            title="Quick Exit"
            subtitle="Close the app immediately"
            onPress={handleQuickExit}
          />
          <SettingItem
            icon="delete-forever"
            title="Delete All Data"
            subtitle="Permanently remove all your data"
            onPress={handleWipeData}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});


