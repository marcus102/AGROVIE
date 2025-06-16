import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  X,
  Check,
  ChevronDown,
  Upload,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import { useAuthStore } from '@/stores/auth';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDynamicPricingStore } from '@/stores/dynamic_pricing';
import { ActorRank } from '@/types/dynamic_pricing';

// Types and constants
type UserRole = 'worker' | 'technician' | 'entrepreneur';
type ExperienceLevel = 'starter' | 'qualified' | 'expert';
type AdvantageType =
  | 'meal'
  | 'accommodation'
  | 'performance_bonus'
  | 'transport'
  | 'other';
type SurfaceUnit = 'hectares' | 'acres';

const technicianSpecializations = [
  {
    label: 'Techniciens en Agriculture de Précision',
    value: 'precision_agriculture_technician',
  },
  {
    label: 'Techniciens en Matériel Agricole',
    value: 'agricultural_equipment_technician',
  },
  {
    label: 'Techniciens en Cultures et Sols',
    value: 'crop_and_soil_technician',
  },
  {
    label: 'Techniciens de Recherche et Laboratoire',
    value: 'research_and_laboratory_technician',
  },
  {
    label: 'Techniciens en Élevage et Laitier',
    value: 'livestock_and_airy_technician',
  },
  {
    label: 'Techniciens en Sécurité Alimentaire et Qualité',
    value: 'food_safety_and_quality_technician',
  },
  {
    label: 'Techniciens en Gestion des Ravageurs et Environnement',
    value: 'pest_management_and_environmental_technician',
  },
  {
    label: "Techniciens d'Inspection et Certification",
    value: 'inspection_and_certification_technician',
  },
  {
    label: 'Techniciens en Vente et Support',
    value: 'sales_and_support_technician',
  },
  { label: 'Autre', value: 'other' },
];

const workerSpecializations = [
  { label: 'Ouvriers de Production Végétale', value: 'crop_production_worker' },
  { label: 'Ouvriers en Élevage', value: 'livestock_worker' },
  { label: 'Ouvriers Mécanisés', value: 'mechanized_worker' },
  { label: 'Ouvriers de Transformation', value: 'processing_worker' },
  { label: 'Ouvriers Spécialisés', value: 'specialized_worker' },
  { label: 'Ouvriers Saisonniers', value: 'seasonal_worker' },
  { label: "Ouvriers d'Entretien", value: 'maintenance_worker' },
  { label: 'Autre', value: 'other' },
];

const locationSuggestions = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Banfora',
  'Ouahigouya',
  'Pouytenga',
  'Kaya',
  'Tenkodogo',
  "Fada N'Gourma",
  'Gaoua',
  'Dédougou',
  'Réo',
  'Manga',
  'Ziniaré',
  'Kombissiri',
];

const advantageOptions = [
  { label: 'Repas fournis', value: 'meal' },
  { label: 'Logement', value: 'accommodation' },
  { label: 'Prime de performance', value: 'performance_bonus' },
  { label: 'Transport', value: 'transport' },
  { label: 'Autre', value: 'other' },
];

interface FormData {
  mission_title: string;
  mission_description: string;
  location: string;
  start_date: string;
  end_date: string;
  needed_actor: UserRole;
  actor_specialization: string;
  other_actor_specialization: string;
  needed_actor_amount: number;
  required_experience_level: ExperienceLevel;
  surface_area: number;
  surface_unit: SurfaceUnit;
  equipment: boolean;
  proposed_advantages: AdvantageType[];
  original_price: string;
  adjustment_price: string;
  final_price: string;
  mission_images: string[];
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateMissionScreen() {
  const { colors } = useThemeStore();
  const { draftMission, createMission, loading } = useMissionStore();
  const { fetchPricings, dynamicPricing, loadingPricing, errorPricing } =
    useDynamicPricingStore();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    mission_title: '',
    mission_description: '',
    location: '',
    start_date: '',
    end_date: '',
    needed_actor: 'worker',
    actor_specialization: '',
    other_actor_specialization: '',
    needed_actor_amount: 1,
    required_experience_level: 'starter',
    surface_area: 0,
    surface_unit: 'hectares',
    equipment: false,
    proposed_advantages: [],
    original_price: '',
    adjustment_price: '0',
    final_price: '',
    mission_images: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(
    null
  );
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: string]: number;
  }>({});
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // Load draft mission data
  useEffect(() => {
    if (draftMission) {
      setFormData((prev) => {
        // Only allow needed_actor values that are valid UserRole
        const validUserRoles: UserRole[] = [
          'worker',
          'technician',
          'entrepreneur',
        ];
        const needed_actor: UserRole = validUserRoles.includes(
          draftMission.needed_actor as UserRole
        )
          ? (draftMission.needed_actor as UserRole)
          : 'worker';

        // Only allow surface_unit values that are valid SurfaceUnit
        const validSurfaceUnits: SurfaceUnit[] = ['hectares', 'acres'];
        const surface_unit: SurfaceUnit = validSurfaceUnits.includes(
          draftMission.surface_unit as SurfaceUnit
        )
          ? (draftMission.surface_unit as SurfaceUnit)
          : 'hectares';

        return {
          ...prev,
          ...draftMission,
          needed_actor,
          surface_unit,
          start_date: draftMission.start_date || '',
          end_date: draftMission.end_date || '',
          original_price: draftMission.original_price?.price || '',
          adjustment_price: draftMission.adjustment_price?.price || '0',
          final_price: draftMission.final_price || '',
          mission_images: draftMission.mission_images || [],
        };
      });
    }
  }, [draftMission]);

  // useEffect(() => {
  //   const fetchPricingData = async () => {
  //     // Only fetch when all required parameters are available
  //     // console.log('Fetching dynamic pricing with:', {
  //     //   actor_rank: formData.needed_actor as ActorRank,
  //     //   actor_specialization2: formData.actor_specialization,
  //     //   experience_level: formData.required_experience_level,
  //     //   surface_unit2: formData.surface_unit,
  //     // });
  //     if (
  //       formData.needed_actor &&
  //       formData.actor_specialization &&
  //       formData.required_experience_level &&
  //       formData.surface_unit
  //     ) {
  //       await fetchPricings({
  //         actor_rank: formData.needed_actor as ActorRank,
  //         actor_specialization2: formData.actor_specialization,
  //         experience_level: formData.required_experience_level,
  //         surface_unit2: formData.surface_unit,
  //       });

  //       console.log('Fetched dynamic pricing:', dynamicPricing);
  //     }
  //   };

  //   fetchPricingData();
  // }, [
  //   formData.needed_actor,
  //   formData.actor_specialization,
  //   formData.required_experience_level,
  //   formData.surface_unit,
  //   fetchPricings,
  // ]);

  // // Updated price calculation useEffect
  // useEffect(() => {
  //   if (loadingPricing || !dynamicPricing || dynamicPricing.length === 0)
  //     return;

  //   const calculateBasePrice = () => {
  //     // Find matching rule from fetched dynamicPricing
  //     const rule = dynamicPricing.find(
  //       (r) =>
  //         r.actor_rank ===
  //           formData.needed_actor.charAt(0).toUpperCase() +
  //             formData.needed_actor.slice(1) &&
  //         r.actor_specialization2 === formData.actor_specialization &&
  //         r.experience_level === formData.required_experience_level &&
  //         r.surface_unit2 === formData.surface_unit
  //     );

  //     if (!rule) return null;

  //     // Calculate base price
  //     let basePrice =
  //       rule.specialization_base_price * rule.experience_multiplier;
  //     basePrice += formData.surface_area * rule.surface_unit_price;

  //     if (formData.equipment) {
  //       basePrice += rule.equipments_price;
  //     }

  //     // Apply advantages reduction
  //     if (formData.proposed_advantages.length > 0) {
  //       basePrice *= 1 - rule.advantages_reduction / 100;
  //     }

  //     return Math.round(basePrice);
  //   };

  //   const basePrice = calculateBasePrice();
  //   if (basePrice !== null && basePrice !== undefined) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       original_price: basePrice.toString(),
  //       final_price: (
  //         basePrice + parseFloat(prev.adjustment_price || '0')
  //       ).toString(),
  //     }));
  //   }
  // }, [
  //   formData.needed_actor,
  //   formData.actor_specialization,
  //   formData.required_experience_level,
  //   formData.surface_area,
  //   formData.surface_unit,
  //   formData.equipment,
  //   formData.proposed_advantages,
  //   dynamicPricing,
  //   loadingPricing,
  // ]);

  // Validation functions

  // Effect to update final price when original or adjustment changes
  useEffect(() => {
    const original = parseFloat(formData.original_price) || 0;
    const adjustment = parseFloat(formData.adjustment_price) || 0;
    setFormData((prev) => ({
      ...prev,
      final_price: (original + adjustment).toString(),
    }));
  }, [formData.original_price, formData.adjustment_price]);

  const calculatePrice = async () => {
    setCalculatingPrice(true);
    try {
      await fetchPricings({
        actor_rank: formData.needed_actor as ActorRank,
        actor_specialization2: formData.actor_specialization,
        experience_level: formData.required_experience_level,
        surface_unit2: formData.surface_unit,
      });

      if (errorPricing) {
        throw new Error(errorPricing);
      }

      if (!loadingPricing) {
        if (!dynamicPricing || dynamicPricing.length === 0) {
          throw new Error('No pricing rules found');
        }

        const rule = dynamicPricing[0];
        let basePrice =
          rule.specialization_base_price * rule.experience_multiplier;
        basePrice += formData.surface_area * rule.surface_unit_price;

        if (formData.equipment) {
          basePrice += rule.equipments_price;
        }

        if (formData.proposed_advantages.length > 0) {
          basePrice *= 1 - rule.advantages_reduction / 100;
        }

        setFormData((prev) => ({
          ...prev,
          original_price: Math.round(basePrice).toString(),
        }));
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de calculer le prix. Veuillez vérifier vos paramètres.'
      );
    } finally {
      setCalculatingPrice(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.mission_title.trim())
          newErrors.mission_title = 'Le titre est requis';
        if (!formData.mission_description.trim())
          newErrors.mission_description = 'La description est requise';
        if (!formData.location.trim())
          newErrors.location = 'La localisation est requise';
        break;
      case 2:
        if (!formData.start_date)
          newErrors.start_date = 'La date de début est requise';
        if (!formData.end_date)
          newErrors.end_date = 'La date de fin est requise';
        if (
          formData.start_date &&
          formData.end_date &&
          new Date(formData.start_date) >= new Date(formData.end_date)
        ) {
          newErrors.end_date =
            'La date de fin doit être après la date de début';
        }
        break;
      case 3:
        if (!formData.actor_specialization)
          newErrors.actor_specialization = 'La spécialisation est requise';
        if (
          formData.actor_specialization === 'other' &&
          !formData.other_actor_specialization.trim()
        ) {
          newErrors.other_actor_specialization =
            'Veuillez préciser la spécialisation';
        }
        if (formData.needed_actor_amount < 1)
          newErrors.needed_actor_amount = 'Le nombre doit être supérieur à 0';
        break;
      case 4:
        if (
          !formData.original_price ||
          parseFloat(formData.original_price) <= 0
        ) {
          newErrors.original_price = 'Le prix doit être supérieur à 0';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image upload function
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `missions/${user?.id}/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const arrayBuffer = decode(base64);

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) throw error;
      return filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Handle image selection and upload
  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uploadId = Date.now().toString();

      setUploadingImages((prev) => ({ ...prev, [uploadId]: 0 }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadingImages((prev) => {
          const currentProgress = prev[uploadId] || 0;
          if (currentProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [uploadId]: currentProgress + 10 };
        });
      }, 200);

      const uploadedPath = await uploadImage(asset.uri);

      if (uploadedPath) {
        setUploadingImages((prev) => ({ ...prev, [uploadId]: 100 }));
        setTimeout(() => {
          setUploadingImages((prev) => {
            const newState = { ...prev };
            delete newState[uploadId];
            return newState;
          });
          setFormData((prev) => ({
            ...prev,
            mission_images: [...prev.mission_images, uploadedPath],
          }));
        }, 500);
      } else {
        setUploadingImages((prev) => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
        Alert.alert('Erreur', "Échec du téléchargement de l'image");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      const missionData = {
        ...formData,
        actor_specialization: formData.actor_specialization as any, // Cast to correct union type if needed
        original_price: {
          price: formData.original_price.toString(),
          status: 'current' as const,
        },
        adjustment_price: {
          price: formData.adjustment_price.toString(),
          status: 'not_current' as const,
        },
      };

      const result = await createMission(missionData);
      if (result) {
        Alert.alert(
          'Succès',
          'Votre mission a été créée avec succès et est en cours de révision.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de la mission'
      );
    }
  };

  // Date formatting
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get specialization options based on role
  const getSpecializationOptions = () => {
    return formData.needed_actor === 'technician'
      ? technicianSpecializations
      : workerSpecializations;
  };

  // Filter location suggestions
  const filteredLocationSuggestions = locationSuggestions.filter((location) =>
    location.toLowerCase().includes(formData.location.toLowerCase())
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Informations générales
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Titre de la mission *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.mission_title
                      ? colors.error
                      : colors.border,
                  },
                ]}
                value={formData.mission_title}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, mission_title: text }));
                  if (errors.mission_title)
                    setErrors((prev) => ({ ...prev, mission_title: '' }));
                }}
                placeholder="Ex: Récolte de maïs"
                placeholderTextColor={colors.muted}
              />
              {errors.mission_title && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.mission_title}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description détaillée *
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.mission_description
                      ? colors.error
                      : colors.border,
                  },
                ]}
                value={formData.mission_description}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    mission_description: text,
                  }));
                  if (errors.mission_description)
                    setErrors((prev) => ({ ...prev, mission_description: '' }));
                }}
                placeholder="Décrivez en détail la mission, les tâches à accomplir, les conditions de travail..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />
              {errors.mission_description && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.mission_description}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Localisation *
              </Text>
              <View style={styles.locationContainer}>
                <View style={styles.locationInputContainer}>
                  <MapPin size={20} color={colors.muted} />
                  <TextInput
                    style={[styles.locationInput, { color: colors.text }]}
                    value={formData.location}
                    onChangeText={(text) => {
                      setFormData((prev) => ({ ...prev, location: text }));
                      setShowLocationSuggestions(text.length > 0);
                      if (errors.location)
                        setErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    onFocus={() =>
                      setShowLocationSuggestions(formData.location.length > 0)
                    }
                    placeholder="Ville ou région"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                {showLocationSuggestions &&
                  filteredLocationSuggestions.length > 0 && (
                    <View
                      style={[
                        styles.suggestionsContainer,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      {filteredLocationSuggestions
                        .slice(0, 5)
                        .map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setFormData((prev) => ({
                                ...prev,
                                location: suggestion,
                              }));
                              setShowLocationSuggestions(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.suggestionText,
                                { color: colors.text },
                              ]}
                            >
                              {suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
              </View>
              {errors.location && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.location}
                </Text>
              )}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Dates et durée
            </Text>

            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Date de début *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.start_date
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                  onPress={() => setShowDatePicker('start')}
                >
                  <Calendar size={20} color={colors.muted} />
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: formData.start_date ? colors.text : colors.muted,
                      },
                    ]}
                  >
                    {formData.start_date
                      ? formatDate(new Date(formData.start_date))
                      : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
                {errors.start_date && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.start_date}
                  </Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Date de fin *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.end_date
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                  onPress={() => setShowDatePicker('end')}
                >
                  <Calendar size={20} color={colors.muted} />
                  <Text
                    style={[
                      styles.dateText,
                      { color: formData.end_date ? colors.text : colors.muted },
                    ]}
                  >
                    {formData.end_date
                      ? formatDate(new Date(formData.end_date))
                      : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
                {errors.end_date && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.end_date}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.surfaceRow}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Surface (optionnel)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={formData.surface_area.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      surface_area: parseFloat(text) || 0,
                    }))
                  }
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Unité
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      surface_unit:
                        prev.surface_unit === 'hectares' ? 'acres' : 'hectares',
                    }));
                  }}
                >
                  <Text style={[{ color: colors.text }]}>
                    {formData.surface_unit}
                  </Text>
                  <ChevronDown size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={
                  new Date(
                    formData[
                      showDatePicker === 'start' ? 'start_date' : 'end_date'
                    ] || Date.now()
                  )
                }
                mode="date"
                display="default"
                minimumDate={
                  showDatePicker === 'start'
                    ? new Date()
                    : new Date(formData.start_date || Date.now())
                }
                onChange={(event, selectedDate) => {
                  setShowDatePicker(null);
                  if (selectedDate) {
                    const field =
                      showDatePicker === 'start' ? 'start_date' : 'end_date';
                    setFormData((prev) => ({
                      ...prev,
                      [field]: selectedDate.toISOString().split('T')[0],
                    }));
                    if (errors[field])
                      setErrors((prev) => ({ ...prev, [field]: '' }));
                  }
                }}
              />
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Profil recherché
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Type d'acteur
              </Text>
              <View style={styles.roleSelector}>
                {(['worker', 'technician'] as UserRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      {
                        backgroundColor:
                          formData.needed_actor === role
                            ? colors.primary
                            : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({
                        ...prev,
                        needed_actor: role,
                        actor_specialization: '',
                      }));
                    }}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        {
                          color:
                            formData.needed_actor === role
                              ? colors.card
                              : colors.text,
                        },
                      ]}
                    >
                      {role === 'worker' ? 'Ouvrier' : 'Technicien'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Spécialisation *
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.actor_specialization
                      ? colors.error
                      : colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => setShowSpecializationModal(true)}
              >
                <Text
                  style={[
                    {
                      color: formData.actor_specialization
                        ? colors.text
                        : colors.muted,
                    },
                  ]}
                >
                  {formData.actor_specialization
                    ? getSpecializationOptions().find(
                        (opt) => opt.value === formData.actor_specialization
                      )?.label || 'Sélectionner'
                    : 'Sélectionner une spécialisation'}
                </Text>
                <ChevronDown size={20} color={colors.muted} />
              </TouchableOpacity>
              {errors.actor_specialization && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.actor_specialization}
                </Text>
              )}
            </View>

            {formData.actor_specialization === 'other' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Précisez la spécialisation *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: errors.other_actor_specialization
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                  value={formData.other_actor_specialization}
                  onChangeText={(text) => {
                    setFormData((prev) => ({
                      ...prev,
                      other_actor_specialization: text,
                    }));
                    if (errors.other_actor_specialization)
                      setErrors((prev) => ({
                        ...prev,
                        other_actor_specialization: '',
                      }));
                  }}
                  placeholder="Décrivez la spécialisation requise"
                  placeholderTextColor={colors.muted}
                />
                {errors.other_actor_specialization && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.other_actor_specialization}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nombre de personnes *
                </Text>
                <View style={styles.numberInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.numberButton,
                      { backgroundColor: colors.border },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        needed_actor_amount: Math.max(
                          1,
                          prev.needed_actor_amount - 1
                        ),
                      }))
                    }
                  >
                    <Text
                      style={[styles.numberButtonText, { color: colors.text }]}
                    >
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.numberValue, { color: colors.text }]}>
                    {formData.needed_actor_amount}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.numberButton,
                      { backgroundColor: colors.border },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        needed_actor_amount: prev.needed_actor_amount + 1,
                      }))
                    }
                  >
                    <Text
                      style={[styles.numberButtonText, { color: colors.text }]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.needed_actor_amount && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.needed_actor_amount}
                  </Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Niveau d'expérience
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                  ]}
                  onPress={() => {
                    const levels: ExperienceLevel[] = [
                      'starter',
                      'qualified',
                      'expert',
                    ];
                    const currentIndex = levels.indexOf(
                      formData.required_experience_level
                    );
                    const nextIndex = (currentIndex + 1) % levels.length;
                    setFormData((prev) => ({
                      ...prev,
                      required_experience_level: levels[nextIndex],
                    }));
                  }}
                >
                  <Text style={[{ color: colors.text }]}>
                    {formData.required_experience_level === 'starter'
                      ? 'Débutant'
                      : formData.required_experience_level === 'qualified'
                      ? 'Qualifié'
                      : 'Expert'}
                  </Text>
                  <ChevronDown size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Équipement fourni
              </Text>
              <TouchableOpacity
                style={[
                  styles.checkboxContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    equipment: !prev.equipment,
                  }))
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: formData.equipment
                        ? colors.primary
                        : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {formData.equipment && (
                    <Check size={16} color={colors.card} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Nous fournissons l'équipement nécessaire
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Avantages proposés
              </Text>
              <View style={styles.advantagesGrid}>
                {advantageOptions.map((advantage) => (
                  <TouchableOpacity
                    key={advantage.value}
                    style={[
                      styles.advantageOption,
                      {
                        backgroundColor: formData.proposed_advantages.includes(
                          advantage.value as AdvantageType
                        )
                          ? colors.primary + '20'
                          : colors.card,
                        borderColor: formData.proposed_advantages.includes(
                          advantage.value as AdvantageType
                        )
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({
                        ...prev,
                        proposed_advantages: prev.proposed_advantages.includes(
                          advantage.value as AdvantageType
                        )
                          ? prev.proposed_advantages.filter(
                              (a) => a !== advantage.value
                            )
                          : [
                              ...prev.proposed_advantages,
                              advantage.value as AdvantageType,
                            ],
                      }));
                    }}
                  >
                    <Text
                      style={[
                        styles.advantageText,
                        {
                          color: formData.proposed_advantages.includes(
                            advantage.value as AdvantageType
                          )
                            ? colors.primary
                            : colors.text,
                        },
                      ]}
                    >
                      {advantage.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Prix et images
            </Text>

            <View style={styles.priceRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Prix de base (calculé) *
                </Text>
                <View style={styles.priceInputContainer}>
                  {/* <DollarSign size={20} color={colors.muted} /> */}
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    value={formData.original_price}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    editable={false} // Make field read-only
                  />
                </View>
                {errors.original_price && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.original_price}
                  </Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Ajustement (FCFA)
                </Text>
                <View style={styles.priceInputContainer}>
                  <Plus size={20} color={colors.muted} />
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    value={formData.adjustment_price}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjustment_price: text,
                      }))
                    }
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View
              style={[
                styles.finalPriceContainer,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.finalPriceLabel, { color: colors.primary }]}>
                Prix final
              </Text>
              <Text style={[styles.finalPriceValue, { color: colors.primary }]}>
                {parseInt(formData.final_price || '0').toLocaleString()} FCFA
              </Text>
            </View>

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
                <Text
                  style={[styles.imageUploadText, { color: colors.primary }]}
                >
                  Ajouter des images
                </Text>
              </TouchableOpacity>

              {/* Upload progress indicators */}
              {Object.entries(uploadingImages).map(([id, progress]) => (
                <View
                  key={id}
                  style={[
                    styles.uploadProgress,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Upload size={20} color={colors.primary} />
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressText, { color: colors.text }]}>
                      Téléchargement en cours...
                    </Text>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: colors.border },
                      ]}
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
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: colors.primary },
                    ]}
                  >
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
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          mission_images: prev.mission_images.filter(
                            (_, i) => i !== index
                          ),
                        }));
                      }}
                    >
                      <X size={16} color={colors.card} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Créer une mission
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress indicator */}
      <View
        style={[styles.progressContainer, { backgroundColor: colors.card }]}
      >
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4].map((step) => (
            <View key={step} style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  {
                    backgroundColor:
                      step <= currentStep ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressNumber,
                    { color: step <= currentStep ? colors.card : colors.muted },
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < 4 && (
                <View
                  style={[
                    styles.progressLine,
                    {
                      backgroundColor:
                        step < currentStep ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        <Text style={[styles.progressText, { color: colors.muted }]}>
          Étape {currentStep} sur 4
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.backFooterButton,
                { borderColor: colors.border },
              ]}
              onPress={() => setCurrentStep((prev) => prev - 1)}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                Précédent
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.nextFooterButton,
              { backgroundColor: colors.primary },
              (loading || calculatingPrice) && styles.disabledButton,
            ]}
            onPress={async () => {
              if (currentStep < 4) {
                if (validateStep(currentStep)) {
                  // Calculate price when moving to step 4
                  if (currentStep === 3) {
                    await calculatePrice();
                  }
                  setCurrentStep((prev) => prev + 1);
                }
              } else {
                handleSubmit();
              }
            }}
            disabled={loading || calculatingPrice}
          >
            {loading || calculatingPrice ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={[styles.nextButtonText, { color: colors.card }]}>
                {currentStep === 4 ? 'Créer la mission' : 'Suivant'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Specialization Modal */}
      <Modal
        visible={showSpecializationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSpecializationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Choisir une spécialisation
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSpecializationModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {getSpecializationOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.actor_specialization === option.value
                          ? colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      actor_specialization: option.value,
                    }));
                    setShowSpecializationModal(false);
                    if (errors.actor_specialization)
                      setErrors((prev) => ({
                        ...prev,
                        actor_specialization: '',
                      }));
                  }}
                >
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}
                  >
                    {option.label}
                  </Text>
                  {formData.actor_specialization === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  // progressText: {
  //   fontFamily: 'Inter-Regular',
  //   fontSize: 14,
  //   textAlign: 'center',
  // },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  locationContainer: {
    position: 'relative',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  locationInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  surfaceRow: {
    flexDirection: 'row',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  numberButton: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advantageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  advantageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  finalPriceContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  finalPriceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  finalPriceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFooterButton: {
    borderWidth: 1,
  },
  nextFooterButton: {
    // backgroundColor set dynamically
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
});
