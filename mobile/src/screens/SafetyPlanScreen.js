import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { getSafetyPlans, saveSafetyPlan } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SafetyPlanScreen() {
  const { anonymousId, encryptData, decryptData } = useAppContext();
  const [plan, setPlan] = useState({
    planName: 'My Safety Plan',
    content: '',
    steps: [],
    emergencyContacts: [],
    safePlaces: [],
  });
  const [newStep, setNewStep] = useState({ title: '', description: '' });
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [newPlace, setNewPlace] = useState({ name: '', address: '', notes: '' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const response = await getSafetyPlans(anonymousId);
      if (response.success && response.plans.length > 0) {
        const loadedPlan = response.plans[0];
        // Decrypt content if needed
        setPlan({
          ...loadedPlan,
          content: decryptData(loadedPlan.content) || loadedPlan.content,
        });
      }
    } catch (error) {
      console.error('Load plan error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const encryptedContent = encryptData(plan.content);
      const response = await saveSafetyPlan({
        anonymousId,
        planName: plan.planName,
        content: encryptedContent,
        steps: plan.steps,
        emergencyContacts: plan.emergencyContacts,
        safePlaces: plan.safePlaces,
      });

      if (response.success) {
        Alert.alert('Success', 'Safety plan saved');
      }
    } catch (error) {
      console.error('Save plan error:', error);
      Alert.alert('Error', 'Failed to save safety plan');
    }
  };

  const addStep = () => {
    if (newStep.title.trim()) {
      setPlan({
        ...plan,
        steps: [...plan.steps, { ...newStep, completed: false }],
      });
      setNewStep({ title: '', description: '' });
    }
  };

  const addContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      setPlan({
        ...plan,
        emergencyContacts: [...plan.emergencyContacts, newContact],
      });
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const addPlace = () => {
    if (newPlace.name.trim()) {
      setPlan({
        ...plan,
        safePlaces: [...plan.safePlaces, newPlace],
      });
      setNewPlace({ name: '', address: '', notes: '' });
    }
  };

  const toggleStep = (index) => {
    const updatedSteps = [...plan.steps];
    updatedSteps[index].completed = !updatedSteps[index].completed;
    setPlan({ ...plan, steps: updatedSteps });
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Plan Overview</Text>
      <TextInput
        style={styles.textArea}
        value={plan.content}
        onChangeText={(text) => setPlan({ ...plan, content: text })}
        placeholder="Write your safety plan here..."
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        numberOfLines={8}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSteps = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Safety Steps</Text>
      
      {plan.steps.map((step, index) => (
        <TouchableOpacity
          key={index}
          style={styles.stepCard}
          onPress={() => toggleStep(index)}
        >
          <View style={styles.stepHeader}>
            <Icon
              name={step.completed ? 'check-circle' : 'circle-outline'}
              size={24}
              color={step.completed ? theme.colors.success : theme.colors.textSecondary}
            />
            <Text style={[styles.stepTitle, step.completed && styles.stepCompleted]}>
              {step.title}
            </Text>
          </View>
          {step.description && (
            <Text style={styles.stepDescription}>{step.description}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={newStep.title}
          onChangeText={(text) => setNewStep({ ...newStep, title: text })}
          placeholder="Step title"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newStep.description}
          onChangeText={(text) => setNewStep({ ...newStep, description: text })}
          placeholder="Step description (optional)"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={addStep}>
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Step</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContacts = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      
      {plan.emergencyContacts.map((contact, index) => (
        <View key={index} style={styles.contactCard}>
          <Icon name="account" size={24} color={theme.colors.primary} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactDetails}>{contact.phone}</Text>
            {contact.relationship && (
              <Text style={styles.contactRelationship}>{contact.relationship}</Text>
            )}
          </View>
        </View>
      ))}

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={newContact.name}
          onChangeText={(text) => setNewContact({ ...newContact, name: text })}
          placeholder="Contact name"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          value={newContact.phone}
          onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
          placeholder="Phone number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          value={newContact.relationship}
          onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
          placeholder="Relationship (optional)"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlaces = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Safe Places</Text>
      
      {plan.safePlaces.map((place, index) => (
        <View key={index} style={styles.placeCard}>
          <Icon name="map-marker" size={24} color={theme.colors.accent} />
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{place.name}</Text>
            {place.address && (
              <Text style={styles.placeAddress}>{place.address}</Text>
            )}
            {place.notes && (
              <Text style={styles.placeNotes}>{place.notes}</Text>
            )}
          </View>
        </View>
      ))}

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={newPlace.name}
          onChangeText={(text) => setNewPlace({ ...newPlace, name: text })}
          placeholder="Place name"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          value={newPlace.address}
          onChangeText={(text) => setNewPlace({ ...newPlace, address: text })}
          placeholder="Address (optional)"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newPlace.notes}
          onChangeText={(text) => setNewPlace({ ...newPlace, notes: text })}
          placeholder="Notes (optional)"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={addPlace}>
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Place</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Plan</Text>
        <Text style={styles.subtitle}>Build your personalized safety plan</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'steps' && styles.tabActive]}
          onPress={() => setActiveTab('steps')}
        >
          <Text style={[styles.tabText, activeTab === 'steps' && styles.tabTextActive]}>
            Steps
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.tabTextActive]}>
            Contacts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'places' && styles.tabActive]}
          onPress={() => setActiveTab('places')}
        >
          <Text style={[styles.tabText, activeTab === 'places' && styles.tabTextActive]}>
            Places
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'steps' && renderSteps()}
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'places' && renderPlaces()}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  stepCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  stepDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginLeft: 32,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  contactInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  contactName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  contactDetails: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  contactRelationship: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  placeInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  placeName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  placeAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  placeNotes: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  addSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});


