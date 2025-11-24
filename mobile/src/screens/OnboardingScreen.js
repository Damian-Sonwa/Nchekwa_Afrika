import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { createAnonymousSession } from '../services/api';

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAppContext();

  const steps = [
    {
      title: 'Welcome',
      description: 'You are safe here. This app provides support, resources, and tools to help you on your journey.',
      icon: '🛡️',
    },
    {
      title: 'Privacy First',
      description: 'Your privacy is our priority. All data is encrypted, and you can delete everything at any time.',
      icon: '🔒',
    },
    {
      title: 'You Are Not Alone',
      description: 'Connect with trained counselors, access resources, and build your safety plan—all anonymously.',
      icon: '💙',
    },
    {
      title: 'Quick Exit',
      description: 'Tap the quick exit button anytime to instantly close the app if you need to.',
      icon: '🚪',
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        const response = await createAnonymousSession();
        if (response.success) {
          await completeOnboarding(response.anonymousId);
        }
      } catch (error) {
        console.error('Onboarding error:', error);
        // Still complete onboarding with local ID
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await completeOnboarding(localId);
      }
    }
  };

  const handleSkip = async () => {
    try {
      const response = await createAnonymousSession();
      if (response.success) {
        await completeOnboarding(response.anonymousId);
      }
    } catch (error) {
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await completeOnboarding(localId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepContainer}>
          <Text style={styles.icon}>{steps[currentStep].icon}</Text>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>
        </View>

        <View style={styles.indicatorContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep < steps.length - 1 ? (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleNext}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  skipButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  nextButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  getStartedButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


