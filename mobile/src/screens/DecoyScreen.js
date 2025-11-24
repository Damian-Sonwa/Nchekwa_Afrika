import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DecoyScreen() {
  const navigation = useNavigation();

  // This screen appears as a normal app (e.g., a fitness tracker, weather app, etc.)
  // to disguise the true purpose of the app

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Tracker</Text>
        <Text style={styles.subtitle}>Your daily activity</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>2,547</Text>
          <Text style={styles.statsLabel}>Steps Today</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>1.2</Text>
          <Text style={styles.statsLabel}>Miles Walked</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>45</Text>
          <Text style={styles.statsLabel}>Minutes Active</Text>
        </View>

        <View style={styles.placeholderCard}>
          <Icon name="chart-line" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.placeholderText}>Activity Chart</Text>
        </View>

        <View style={styles.placeholderCard}>
          <Icon name="trophy" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.placeholderText}>Achievements</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.hiddenButton}
        onPress={() => navigation.navigate('Main')}
      >
        {/* Invisible button to return to main app */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statsNumber: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statsLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  placeholderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...theme.shadows.sm,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  hiddenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    opacity: 0,
  },
});


