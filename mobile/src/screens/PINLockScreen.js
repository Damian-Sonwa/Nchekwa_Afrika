import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PINLockScreen() {
  const { unlockApp, pin } = useAppContext();
  const [enteredPIN, setEnteredPIN] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        // Auto-trigger biometric on mount
        handleBiometric();
      }
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const handleBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await unlockApp(pin);
      }
    } catch (error) {
      console.error('Biometric error:', error);
    }
  };

  const handleNumberPress = (number) => {
    if (enteredPIN.length < 6) {
      const newPIN = enteredPIN + number;
      setEnteredPIN(newPIN);

      if (newPIN.length === 6) {
        verifyPIN(newPIN);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPIN(enteredPIN.slice(0, -1));
  };

  const verifyPIN = async (pinToVerify) => {
    const isValid = await unlockApp(pinToVerify);
    
    if (isValid) {
      setEnteredPIN('');
      setAttempts(0);
    } else {
      setAttempts(attempts + 1);
      setEnteredPIN('');
      Vibration.vibrate(400);

      if (attempts >= 4) {
        Alert.alert(
          'Too Many Attempts',
          'Please wait before trying again.',
          [{ text: 'OK' }]
        );
        // In production, implement lockout timer
      } else {
        Alert.alert('Incorrect PIN', `Attempts remaining: ${5 - attempts}`);
      }
    }
  };

  const renderPINDots = () => {
    return (
      <View style={styles.pinDots}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < enteredPIN.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((number) => (
              <TouchableOpacity
                key={number}
                style={styles.numberButton}
                onPress={() => handleNumberPress(number.toString())}
              >
                <Text style={styles.numberText}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.numberRow}>
          <View style={styles.numberButton} />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleNumberPress('0')}
          >
            <Text style={styles.numberText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={handleDelete}
          >
            <Icon name="backspace" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="lock" size={64} color={theme.colors.primary} />
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Unlock the app</Text>
      </View>

      {renderPINDots()}

      {biometricAvailable && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometric}
        >
          <Icon name="fingerprint" size={32} color={theme.colors.primary} />
          <Text style={styles.biometricText}>Use Biometric</Text>
        </TouchableOpacity>
      )}

      {renderNumberPad()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  pinDotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  biometricButton: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  biometricText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  numberPad: {
    marginTop: theme.spacing.xl,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  numberText: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
});


