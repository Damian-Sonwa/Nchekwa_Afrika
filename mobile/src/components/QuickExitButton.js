import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';

export default function QuickExitButton({ style }) {
  const navigation = useNavigation();

  const handleQuickExit = () => {
    Alert.alert(
      'Quick Exit',
      'This will close the app immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // In production, this would use a native module to close the app
            // For now, navigate to a safe screen or minimize
            navigation.navigate('Decoy');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleQuickExit}
      onLongPress={handleQuickExit} // Long press for faster exit
    >
      <Icon name="exit-run" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.sm,
  },
});


