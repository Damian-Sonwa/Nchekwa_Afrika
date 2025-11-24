import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const educationTopics = [
  {
    id: 'understanding',
    title: 'Understanding GBV',
    icon: 'book-open-variant',
    content: `Gender-Based Violence (GBV) refers to harmful acts directed at an individual based on their gender. It includes physical, sexual, emotional, psychological, and economic abuse.

Types of GBV:
• Physical violence
• Sexual violence
• Emotional/psychological abuse
• Economic abuse
• Digital/online abuse

Remember: GBV is never your fault. You deserve support and help.`,
  },
  {
    id: 'rights',
    title: 'Your Rights',
    icon: 'gavel',
    content: `You have the right to:
• Live free from violence and abuse
• Access support services
• Report abuse to authorities
• Seek medical attention
• Obtain legal protection
• Maintain your privacy and confidentiality

These rights are protected by law in most countries.`,
  },
  {
    id: 'safety',
    title: 'Safety Planning',
    icon: 'shield-check',
    content: `A safety plan helps you prepare for dangerous situations:

1. Identify safe places you can go
2. Keep important documents and money in a safe place
3. Memorize emergency contact numbers
4. Plan escape routes from your home
5. Pack an emergency bag with essentials
6. Trust your instincts - if you feel unsafe, leave

Use the Safety Plan tool in this app to create your personalized plan.`,
  },
  {
    id: 'support',
    title: 'Getting Support',
    icon: 'heart',
    content: `You don't have to face this alone. Support is available:

• Helplines: 24/7 confidential support
• Shelters: Safe temporary housing
• Counseling: Professional mental health support
• Legal aid: Help with protection orders and legal processes
• Medical care: Treatment and documentation

All services in this app are confidential and free.`,
  },
  {
    id: 'healing',
    title: 'Healing & Recovery',
    icon: 'flower',
    content: `Healing is a journey, and it looks different for everyone:

• Be patient with yourself
• Seek professional counseling
• Connect with support groups
• Practice self-care
• Set boundaries
• Celebrate small victories

Recovery takes time, but it is possible. You are strong.`,
  },
  {
    id: 'helping',
    title: 'Helping Others',
    icon: 'hand-heart',
    content: `If someone you know is experiencing GBV:

• Listen without judgment
• Believe them
• Don't pressure them to leave
• Offer practical support
• Respect their decisions
• Share resources and information
• Take care of yourself too

Remember: You cannot force someone to seek help, but you can be there for them.`,
  },
];

export default function EducationScreen() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const renderTopic = (topic) => (
    <TouchableOpacity
      key={topic.id}
      style={styles.topicCard}
      onPress={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicIconContainer}>
          <Icon name={topic.icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <Icon
          name={selectedTopic === topic.id ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.textSecondary}
        />
      </View>
      {selectedTopic === topic.id && (
        <View style={styles.topicContent}>
          <Text style={styles.topicText}>{topic.content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Education Hub</Text>
        <Text style={styles.subtitle}>Learn about GBV, your rights, and available support</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Icon name="school" size={32} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Knowledge is power. Understanding GBV, your rights, and available resources can help you make informed decisions about your safety and well-being.
          </Text>
        </View>

        {educationTopics.map(renderTopic)}
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
  introCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  introText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
  topicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  topicTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  topicContent: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  topicText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
});


