import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { getResources } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'helpline', label: 'Helplines', icon: 'phone' },
  { id: 'shelter', label: 'Shelters', icon: 'home' },
  { id: 'legal', label: 'Legal', icon: 'gavel' },
  { id: 'medical', label: 'Medical', icon: 'hospital' },
  { id: 'counseling', label: 'Counseling', icon: 'account-heart' },
];

export default function ResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [selectedCategory, searchQuery, resources]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await getResources();
      if (response.success) {
        setResources(response.resources);
        setFilteredResources(response.resources);
      }
    } catch (error) {
      console.error('Load resources error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    setFilteredResources(filtered);
  };

  const renderResource = ({ item }) => (
    <TouchableOpacity style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        {item.verified && (
          <Icon name="check-circle" size={16} color={theme.colors.success} />
        )}
      </View>
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Text style={styles.resourceDescription}>{item.description}</Text>
      
      {item.contactInfo && (
        <View style={styles.contactInfo}>
          {item.contactInfo.phone && (
            <View style={styles.contactItem}>
              <Icon name="phone" size={16} color={theme.colors.primary} />
              <Text style={styles.contactText}>{item.contactInfo.phone}</Text>
            </View>
          )}
          {item.contactInfo.email && (
            <View style={styles.contactItem}>
              <Icon name="email" size={16} color={theme.colors.primary} />
              <Text style={styles.contactText}>{item.contactInfo.email}</Text>
            </View>
          )}
        </View>
      )}

      {item.available24h && (
        <View style={styles.available24h}>
          <Icon name="clock-outline" size={14} color={theme.colors.success} />
          <Text style={styles.available24hText}>Available 24/7</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getCategoryColor = (category) => {
    const colors = {
      helpline: '#E74C3C',
      shelter: '#3498DB',
      legal: '#9B59B6',
      medical: '#E67E22',
      counseling: '#1ABC9C',
      emergency: '#C0392B',
    };
    return colors[category] || theme.colors.primary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Find help and support near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResource}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resourcesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No resources found</Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  resourcesList: {
    padding: theme.spacing.md,
  },
  resourceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  resourceTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  resourceDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  contactInfo: {
    marginTop: theme.spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  contactText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  available24h: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  available24hText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});


