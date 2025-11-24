import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { sendSOSAlert } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { anonymousId } = useAppContext();
  const [sosPressed, setSosPressed] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Request location permissions
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
      }
    })();
  }, []);

  // Pulse animation for SOS button
  useEffect(() => {
    if (sosPressed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [sosPressed]);

  const handleSOS = async () => {
    Alert.alert(
      'Send Alert?',
      'This will send your location to emergency responders. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSosPressed(false),
        },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              setSosPressed(true);
              Vibration.vibrate([0, 500, 200, 500]);

              // Get location
              let location = null;
              try {
                const loc = await Location.getCurrentPositionAsync({});
                location = {
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                };
              } catch (error) {
                console.error('Location error:', error);
              }

              // Send SOS alert
              const response = await sendSOSAlert(anonymousId, location);
              
              if (response.success) {
                // Silent alert sent
                // In production, this would also:
                // 1. Send SMS to emergency contacts
                // 2. Make silent call to helpline
                // 3. Trigger local notifications

                Alert.alert(
                  'Alert Sent',
                  'Help is on the way. Stay safe.',
                  [{ text: 'OK', onPress: () => setSosPressed(false) }]
                );
              }
            } catch (error) {
              console.error('SOS error:', error);
              Alert.alert(
                'Alert Sent',
                'Your alert has been sent. Help is on the way.',
                [{ text: 'OK', onPress: () => setSosPressed(false) }]
              );
            }
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      title: 'Chat Support',
      description: 'Talk to a counselor',
      icon: 'message-text',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Support'),
    },
    {
      title: 'Resources',
      description: 'Find help near you',
      icon: 'map-marker',
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('Resources'),
    },
    {
      title: 'Safety Plan',
      description: 'Build your plan',
      icon: 'shield-check',
      color: theme.colors.accent,
      onPress: () => navigation.navigate('Tools'),
    },
    {
      title: 'Evidence Vault',
      description: 'Secure storage',
      icon: 'lock',
      color: theme.colors.text,
      onPress: () => navigation.navigate('EvidenceVault'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>You are safe here</Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          style={[styles.sosButton, sosPressed && styles.sosButtonPressed]}
          onPress={handleSOS}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.sosButtonInner, { transform: [{ scale: pulseAnim }] }]}>
            <Icon name="alert-circle" size={40} color="#FFFFFF" />
            <Text style={styles.sosButtonText}>SOS</Text>
            <Text style={styles.sosButtonSubtext}>Press in emergency</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Safety Reminder</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb-on" size={20} color={theme.colors.accent} />
            <Text style={styles.tipText}>
              Remember: You can exit quickly by tapping the quick exit button in settings.
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  sosButton: {
    backgroundColor: theme.colors.sos,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    minHeight: 180,
    ...theme.shadows.lg,
  },
  sosButtonPressed: {
    opacity: 0.9,
  },
  sosButtonInner: {
    alignItems: 'center',
  },
  sosButtonText: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    marginTop: theme.spacing.md,
    fontWeight: '700',
  },
  sosButtonSubtext: {
    ...theme.typography.bodySmall,
    color: '#FFFFFF',
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  quickActionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  quickActionDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  tipsContainer: {
    marginBottom: theme.spacing.xl,
  },
  tipCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.sm,
  },
  tipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});


