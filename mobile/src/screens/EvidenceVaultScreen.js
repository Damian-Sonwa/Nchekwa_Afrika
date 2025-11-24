import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { getEvidence, uploadEvidence, deleteEvidence } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EvidenceVaultScreen({ navigation }) {
  const { anonymousId } = useAppContext();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const response = await getEvidence(anonymousId);
      if (response.success) {
        setEvidence(response.evidence);
      }
    } catch (error) {
      console.error('Load evidence error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Pick document error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Take photo error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg',
        name: file.fileName || `evidence_${Date.now()}.jpg`,
      });
      formData.append('anonymousId', anonymousId);

      const response = await uploadEvidence(formData);
      if (response.success) {
        Alert.alert('Success', 'Evidence uploaded and encrypted');
        loadEvidence();
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload evidence');
    }
  };

  const handleDelete = (evidenceId) => {
    Alert.alert(
      'Delete Evidence',
      'Are you sure you want to delete this evidence? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteEvidence(evidenceId);
              if (response.success) {
                loadEvidence();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete evidence');
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return 'image';
    if (fileType?.includes('pdf')) return 'file-pdf-box';
    if (fileType?.includes('video')) return 'video';
    if (fileType?.includes('audio')) return 'music';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderEvidence = ({ item }) => (
    <View style={styles.evidenceCard}>
      <View style={styles.evidenceHeader}>
        <Icon name={getFileIcon(item.fileType)} size={32} color={theme.colors.primary} />
        <View style={styles.evidenceInfo}>
          <Text style={styles.evidenceName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <Text style={styles.evidenceDetails}>
            {formatFileSize(item.fileSize)} • {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.description && (
            <Text style={styles.evidenceDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Icon name="delete-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Evidence Vault</Text>
          <Text style={styles.subtitle}>Secure, encrypted storage</Text>
        </View>
      </View>

      <View style={styles.uploadButtons}>
        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
          <Icon name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Icon name="image" size={24} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Icon name="file-document" size={24} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Files</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading evidence...</Text>
        </View>
      ) : (
        <FlatList
          data={evidence}
          renderItem={renderEvidence}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.evidenceList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="lock" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No evidence stored</Text>
              <Text style={styles.emptySubtext}>
                Your evidence will be encrypted and stored securely
              </Text>
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
  headerContent: {
    flex: 1,
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
  uploadButtons: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    justifyContent: 'space-around',
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  uploadButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  evidenceList: {
    padding: theme.spacing.md,
  },
  evidenceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  evidenceName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  evidenceDetails: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  evidenceDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.sm,
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
    marginTop: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});


