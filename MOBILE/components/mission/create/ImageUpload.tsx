import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, Upload, Check, X } from 'lucide-react-native';
import { FormData } from './types';

interface ImageUploadProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  colors: any;
  uploadingImages: { [key: string]: number };
  handleImagePicker: () => void;
  removeImage: (index: number) => void;
}

export function ImageUpload({
  formData,
  setFormData,
  colors,
  uploadingImages,
  handleImagePicker,
  removeImage,
}: ImageUploadProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        Images de la mission
      </Text>
      <TouchableOpacity
        style={[
          styles.imageUploadButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={handleImagePicker}
      >
        <Camera size={24} color={colors.primary} />
        <Text style={[styles.imageUploadText, { color: colors.primary }]}>
          Ajouter des images
        </Text>
      </TouchableOpacity>

      {/* Upload progress indicators */}
      {Object.entries(uploadingImages).map(([id, progress]) => (
        <View
          key={id}
          style={[styles.uploadProgress, { backgroundColor: colors.card }]}
        >
          <Upload size={20} color={colors.primary} />
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              Téléchargement en cours...
            </Text>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>
            {progress}%
          </Text>
        </View>
      ))}

      {/* Uploaded images */}
      <View style={styles.uploadedImages}>
        {formData.mission_images.map((image, index) => (
          <View key={index} style={styles.uploadedImageContainer}>
            <View
              style={[
                styles.uploadedImagePlaceholder,
                { backgroundColor: colors.success + '20' },
              ]}
            >
              <Check size={20} color={colors.success} />
            </View>
            <TouchableOpacity
              style={[
                styles.removeImageButton,
                { backgroundColor: colors.error },
              ]}
              onPress={() => removeImage(index)}
            >
              <X size={16} color={colors.card} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  imageUploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  uploadedImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  uploadedImageContainer: {
    position: 'relative',
  },
  uploadedImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
