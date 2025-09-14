import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
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
  ArrowLeft,
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
    onUpdateItems,
    onAddNewInput,
    colors,
  }: {
    field: string;
    label: string;
    Icon: React.ComponentType<any>;
    items: string[];
    onUpdateItems: (newItems: string[]) => void;
    onAddNewInput: () => void;
    colors: any;
  }) => {
    const handleInputChange = useCallback(
      (text: string, index: number) => {
        const newItems = [...items];
        newItems[index] = text;
        onUpdateItems(newItems);
      },
      [items, onUpdateItems]
    );

    const handleRemoveItem = useCallback(
      (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdateItems(newItems);
      },
      [items, onUpdateItems]
    );

    // Ensure there's always at least one empty input
    const displayItems = useMemo(() => {
      if (items.length === 0 || items[items.length - 1] !== '') {
        return [...items, ''];
      }
      return items;
    }, [items]);

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={styles.arraySection}>
          {displayItems.map((item, index) => (
            <View key={`${field}-${index}`} style={styles.arrayInputWrapper}>
              <TextInput
                style={[
                  styles.arrayInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                placeholder="Entrez votre information"
                placeholderTextColor={colors.muted}
                value={item}
                onChangeText={(text) => handleInputChange(text, index)}
                onEndEditing={() => {
                  // Auto-add new input when user finishes typing in the last input
                  if (index === displayItems.length - 1 && item.trim() !== '') {
                    onAddNewInput();
                  }
                }}
              />
              {displayItems.length > 1 && (
                <TouchableOpacity
                  style={[
                    styles.removeButton,
                    { backgroundColor: colors.destructive },
                  ]}
                  onPress={() => handleRemoveItem(index)}
                >
                  <X size={16} color={colors.card} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {/* <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={onAddNewInput}
          >
            <Plus size={20} color={colors.card} />
            <Text style={[styles.addButtonText, { color: colors.card }]}>
              Ajouter un autre champ
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        actual_location: profile.actual_location || '',
        bio: profile.bio || '',
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
      // Filter out empty strings when updating
      const cleanedValue = value.filter((item) => item.trim() !== '');
      setFormData((prev) => ({ ...prev, [field]: cleanedValue }));
    },
    []
  );

  const addNewInputToArray = useCallback(
    (field: keyof FormData) => {
      const currentItems = Array.isArray(formData[field])
        ? formData[field]
        : [];
      // Only add if the last item is not empty
      if (
        currentItems.length === 0 ||
        currentItems[currentItems.length - 1].trim() !== ''
      ) {
        handleArrayUpdate(field, [...currentItems, '']);
      }
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
      // Clean up formData before saving - remove empty strings from arrays
      const cleanedFormData = {
        ...formData,
        portfolio: formData.portfolio.filter((item) => item.trim() !== ''),
        certifications: formData.certifications.filter(
          (item) => item.trim() !== ''
        ),
        languages: formData.languages.filter((item) => item.trim() !== ''),
        skills: formData.skills.filter((item) => item.trim() !== ''),
        work_experience: formData.work_experience.filter(
          (item) => item.trim() !== ''
        ),
        availability_locations: formData.availability_locations.filter(
          (item) => item.trim() !== ''
        ),
      };

      await updateProfile(cleanedFormData);

      if (profile?.id) {
        setProfile({ ...profile, ...cleanedFormData });
      }
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [formData, profile, setProfile, updateProfile]);

  // Memoize array field configurations to prevent unnecessary re-renders
  const arrayFieldConfigs = useMemo(
    () => [
      { field: 'portfolio', label: 'Liens Site Web', Icon: Globe },
      { field: 'certifications', label: 'Certifications', Icon: FileText },
      { field: 'languages', label: 'Langues', Icon: FileText },
      { field: 'skills', label: 'Compétences', Icon: FileText },
      {
        field: 'work_experience',
        label: 'Expérience professionnelle',
        Icon: FileText,
      },
      {
        field: 'availability_locations',
        label: 'Zones de disponibilité',
        Icon: FileText,
      },
    ],
    []
  );

  // Memoized back handler
  const handleBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to go back');
    }
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
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
            label="Biographie"
            value={formData.bio}
            onChangeText={(text) => handleTextChange('bio', text)}
            multiline
            colors={colors}
          />

          {arrayFieldConfigs.map(({ field, label, Icon }) => (
            <MemoizedArrayInputSection
              key={field}
              field={field}
              label={label}
              Icon={Icon}
              items={formData[field as keyof FormData] as string[]}
              onUpdateItems={(newItems) =>
                handleArrayUpdate(field as keyof FormData, newItems)
              }
              onAddNewInput={() => addNewInputToArray(field as keyof FormData)}
              colors={colors}
            />
          ))}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'web' ? 0 : 40,
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
    gap: 12,
  },
  arrayInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrayInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
});
