import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  Camera,
  MapPin,
  Phone,
  Globe,
  FileText,
  Plus,
  X,
  User,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface FormData {
  full_name: string;
  phone: string;
  actual_location: string;
  bio: string;
  portfolio: string[];
  certifications: string[];
  languages: string[];
  skills: string[];
  work_experience: string[];
  availability_locations: string[];
}

const MemoizedInputField = memo(
  ({
    Icon,
    label,
    value,
    onChangeText,
    multiline = false,
    colors,
  }: {
    Icon: React.ComponentType<any>;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    colors: any;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Icon size={30} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          placeholderTextColor={colors.muted}
        />
      </View>
    </View>
  )
);

const MemoizedArrayInputSection = memo(
  ({
    field,
    label,
    Icon,
    items,
    newEntryValue,
    onAdd,
    onRemove,
    onEntryChange,
    colors,
  }: {
    field: string;
    label: string;
    Icon: React.ComponentType<any>;
    items: string[];
    newEntryValue: string;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onEntryChange: (text: string) => void;
    colors: any;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.arraySection}>
        {(Array.isArray(items) ? items : []).map((item, index) => (
          <View
            key={`${field}-${index}`}
            style={[styles.arrayItem, { backgroundColor: colors.card }]}
          >
            <Text style={{ color: colors.text }}>{item}</Text>
            <TouchableOpacity onPress={() => onRemove(index)}>
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.arrayInputWrapper}>
          <TextInput
            style={[
              styles.arrayInput,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Ajouter un nouvel élément"
            placeholderTextColor={colors.muted}
            value={newEntryValue}
            onChangeText={onEntryChange}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={onAdd}
          >
            <Plus size={20} color={colors.card} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
);

export default function EditProfileScreen() {
  const { profile, setProfile, updateProfile } = useAuthStore();
  const { colors } = useThemeStore();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    actual_location: '',
    bio: '',
    portfolio: [],
    certifications: [],
    languages: [],
    skills: [],
    work_experience: [],
    availability_locations: [],
  });
  const [newEntries, setNewEntries] = useState<Record<string, string>>({
    specialization: '',
    portfolio: '',
    certifications: '',
    languages: '',
    skills: '',
    work_experience: '',
    availability_locations: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        actual_location: profile.actual_location || '',
        bio: profile.bio || '',
        specialization: Array.isArray(profile.specialization)
          ? profile.specialization
          : [],
        portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : [],
        certifications: Array.isArray(profile.certifications)
          ? profile.certifications
          : [],
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        work_experience: Array.isArray(profile.work_experience)
          ? profile.work_experience
          : [],
        availability_locations: Array.isArray(profile.availability_locations)
          ? profile.availability_locations
          : [],
      });
    }
  }, [profile]);

  const handleTextChange = useCallback(
    (field: keyof FormData, text: string) => {
      setFormData((prev) => ({ ...prev, [field]: text }));
    },
    []
  );

  const handleArrayUpdate = useCallback(
    (field: keyof FormData, value: string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addToArray = useCallback(
    (field: keyof FormData) => {
      const value = newEntries[field].trim();
      if (value) {
        handleArrayUpdate(field, [...formData[field], value]);
        setNewEntries((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [formData, handleArrayUpdate, newEntries]
  );

  const removeFromArray = useCallback(
    (field: keyof FormData, index: number) => {
      const updatedArray = Array.isArray(formData[field])
        ? formData[field].filter((_, i) => i !== index)
        : [];
      handleArrayUpdate(field, updatedArray);
    },
    [formData, handleArrayUpdate]
  );

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && profile?.id) {
      try {
        setUploading(true);
        const photo = result.assets[0];

        // Use a fixed filename for the profile image
        const filePath = `avatars/${profile.id}/avatar.jpg`;
        const base64 = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: 'base64',
        });
        const arrayBuffer = decode(base64);

        // Delete existing profile picture if it exists
        if (profile.profile_picture) {
          try {
            // Extract file path from existing URL
            const existingUrl = new URL(profile.profile_picture);
            const pathSegments = existingUrl.pathname.split('/');
            const filePath = pathSegments.slice(5).join('/'); // Remove '/storage/v1/object/sign/' prefix

            await supabase.storage.from('profiles').remove([filePath]);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }

        // Upload new image with overwrite
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: true, // Allow overwriting existing file
            cacheControl: '3600', // 1 hour cache
          });

        if (uploadError) throw uploadError;

        // Create new signed URL with 1 week expiration
        const { data: urlData, error: urlError } = await supabase.storage
          .from('profiles')
          .createSignedUrl(filePath, 604800); // 7 days in seconds

        if (urlError) throw urlError;

        // Update profile with new URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_picture: urlData.signedUrl })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        // Update local state
        setProfile({ ...profile, profile_picture: urlData.signedUrl });
      } catch (error) {
        console.error('Error updating profile photo:', error);
      } finally {
        setUploading(false);
      }
    }
  }, [profile, setProfile]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile(formData);

      if (profile?.id) {
        setProfile({ ...profile, ...formData });
      }
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [formData, profile, setProfile]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.imageSection,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.profileImageContainer}>
          {profile?.profile_picture ? (
            <Image
              source={{ uri: profile.profile_picture }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.userIconContainer,
                { backgroundColor: colors.muted },
              ]}
            >
              <User size={50} color={colors.card} />
            </View>
          )}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
            disabled={uploading}
          >
            <Camera size={20} color={colors.card} />
            <Text style={[styles.changeImageText, { color: colors.card }]}>
              {uploading ? 'Téléchargement...' : 'Changer la photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <MemoizedInputField
          Icon={FileText}
          label="Nom complet"
          value={formData.full_name}
          onChangeText={(text) => handleTextChange('full_name', text)}
          colors={colors}
        />

        <MemoizedInputField
          Icon={Phone}
          label="Téléphone"
          value={formData.phone}
          onChangeText={(text) => handleTextChange('phone', text)}
          colors={colors}
        />

        <MemoizedInputField
          Icon={MapPin}
          label="Localisation Actuelle"
          value={formData.actual_location}
          onChangeText={(text) => handleTextChange('actual_location', text)}
          colors={colors}
        />

        <MemoizedInputField
          Icon={FileText}
          label="Bio"
          value={formData.bio}
          onChangeText={(text) => handleTextChange('bio', text)}
          multiline
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="portfolio"
          label="Portfolio"
          Icon={Globe}
          items={formData.portfolio}
          newEntryValue={newEntries.portfolio}
          onAdd={() => addToArray('portfolio')}
          onRemove={(index) => removeFromArray('portfolio', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({ ...prev, portfolio: text }))
          }
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="certifications"
          label="Certifications"
          Icon={FileText}
          items={formData.certifications}
          newEntryValue={newEntries.certifications}
          onAdd={() => addToArray('certifications')}
          onRemove={(index) => removeFromArray('certifications', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({ ...prev, certifications: text }))
          }
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="languages"
          label="Langues"
          Icon={FileText}
          items={formData.languages}
          newEntryValue={newEntries.languages}
          onAdd={() => addToArray('languages')}
          onRemove={(index) => removeFromArray('languages', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({ ...prev, languages: text }))
          }
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="skills"
          label="Compétences"
          Icon={FileText}
          items={formData.skills}
          newEntryValue={newEntries.skills}
          onAdd={() => addToArray('skills')}
          onRemove={(index) => removeFromArray('skills', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({ ...prev, skills: text }))
          }
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="work_experience"
          label="Expérience professionnelle"
          Icon={FileText}
          items={formData.work_experience}
          newEntryValue={newEntries.work_experience}
          onAdd={() => addToArray('work_experience')}
          onRemove={(index) => removeFromArray('work_experience', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({ ...prev, work_experience: text }))
          }
          colors={colors}
        />

        <MemoizedArrayInputSection
          field="availability_locations"
          label="Localisations disponibles"
          Icon={FileText}
          items={formData.availability_locations}
          newEntryValue={newEntries.availability_locations}
          onAdd={() => addToArray('availability_locations')}
          onRemove={(index) => removeFromArray('availability_locations', index)}
          onEntryChange={(text) =>
            setNewEntries((prev) => ({
              ...prev,
              availability_locations: text,
            }))
          }
          colors={colors}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: colors.card }]}>
          Enregistrer les modifications
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  imageContainer: {
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeImageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
  },
  arraySection: {
    gap: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  arrayInputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  arrayInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
