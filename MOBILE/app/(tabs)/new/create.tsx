import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import { useAuthStore } from '@/stores/auth';
import { useDynamicPricingStore } from '@/stores/dynamic_pricing';
import { ActorRank } from '@/types/dynamic_pricing';
import { QuickStartSaveModal } from '@/components/modals/QuickStartSaveModal';
import { Toast, ToastType } from '@/components/Toast';
import * as ImagePicker from 'expo-image-picker';

// Import new components
import {
  FormData,
  FormErrors,
  UserRole,
} from '@/components/mission/create/types';
import { StepOne } from '@/components/mission/create/StepOne';
import { StepTwo } from '@/components/mission/create/SetpTwo';
import { StepThree } from '@/components/mission/create/StepThree';
import { StepFour } from '@/components/mission/create/StepFour';
import { ProgressIndicator } from '@/components/mission/create/ProgressIndicator';
import { NavigationFooter } from '@/components/mission/create/NavigationFooter';
import { validateStep } from '@/utils/missionValidation';
import { uploadImage } from '@/utils/imageUpload';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';

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
    personalized_expression: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: string]: number;
  }>({});
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [createdMission, setCreatedMission] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  const hideToast = () => setToastVisible(false);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  // Load draft mission data
  useEffect(() => {
    if (draftMission) {
      setFormData((prev) => {
        const validUserRoles: UserRole[] = [
          'worker',
          'advisor',
          'entrepreneur',
        ];
        const needed_actor: UserRole = validUserRoles.includes(
          draftMission.needed_actor as UserRole
        )
          ? (draftMission.needed_actor as UserRole)
          : 'worker';

        const validSurfaceUnits: Array<FormData['surface_unit']> = [
          'hectares',
          'square_meter',
        ];
        const surface_unit: FormData['surface_unit'] =
          validSurfaceUnits.includes(
            draftMission.surface_unit as FormData['surface_unit']
          )
            ? (draftMission.surface_unit as FormData['surface_unit'])
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
          personalized_expression:
            typeof draftMission.metadata === 'object' &&
            draftMission.metadata !== null &&
            'personalized_expression' in draftMission.metadata
              ? (draftMission.metadata as { personalized_expression?: string })
                  .personalized_expression || ''
              : '',
        } as FormData;
      });
    }
  }, [draftMission]);

  // Effect to update final price when original or adjustment changes
  useEffect(() => {
    const original = parseFloat(formData.original_price) || 0;
    const adjustment = parseFloat(formData.adjustment_price) || 0;
    setFormData((prev) => ({
      ...prev,
      final_price: (original + adjustment).toString(),
    }));
  }, [formData.original_price, formData.adjustment_price]);

  const calculatePrice = async (): Promise<boolean> => {
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

      if (!loadingPricing && dynamicPricing && dynamicPricing.length > 0) {
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
      } else {
        throw new Error('No pricing rules found');
      }
      return true;
    } catch (error) {
      showToast(
        'error',
        'Impossible de calculer le prix. Veuillez vérifier vos paramètres.'
      );
      return false;
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && user?.id) {
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

      const uploadedPath = await uploadImage(asset.uri, user.id);

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

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mission_images: prev.mission_images.filter((_, i) => i !== index),
    }));
  };

  const handleStepValidation = (step: number): boolean => {
    const newErrors = validateStep(step, formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      if (handleStepValidation(currentStep)) {
        if (currentStep === 3) {
          const success = await calculatePrice();
          if (success) {
            setCurrentStep((prev) => prev + 1);
          }
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!handleStepValidation(4)) return;

    try {
      const missionData = {
        ...formData,
        actor_specialization: formData.actor_specialization as any,
        original_price: {
          price: formData.original_price.toString(),
          status: 'current' as const,
        },
        adjustment_price: {
          price: formData.adjustment_price.toString(),
          status: 'not_current' as const,
        },
        personalized_expression:
          formData.personalized_expression.trim() === ''
            ? null
            : formData.personalized_expression,
      };

      const result = await createMission(missionData);
      if (result) {
        setCreatedMission(result);
        showToast('success', 'Votre mission a été créée avec succès!');
        setTimeout(() => {
          setShowQuickStartModal(true);
        }, 1500);
      }
    } catch (error) {
      showToast(
        'error',
        'Une erreur est survenue lors de la création de la mission'
      );
    }
  };

  const handleQuickStartSaved = () => {
    router.back();
  };

  const handleSkipQuickStart = () => {
    router.push('./(tabs)/new/index');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            colors={colors}
          />
        );
      case 2:
        return (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            colors={colors}
          />
        );
      case 3:
        return (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            colors={colors}
          />
        );
      case 4:
        return (
          <StepFour
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            colors={colors}
            uploadingImages={uploadingImages}
            handleImagePicker={handleImagePicker}
            removeImage={removeImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />

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
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={4}
        colors={colors}
      />

      {/* Content */}
      <KeyboardAwareScrollView style={styles.content}>
        {renderStepContent()}
      </KeyboardAwareScrollView>

      {/* Footer */}
      <NavigationFooter
        currentStep={currentStep}
        totalSteps={4}
        loading={loading}
        calculatingPrice={calculatingPrice}
        colors={colors}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />

      {/* QuickStart Save Modal */}
      {createdMission && (
        <QuickStartSaveModal
          visible={showQuickStartModal}
          onClose={() => {
            setShowQuickStartModal(false);
            handleSkipQuickStart();
          }}
          missionData={{
            mission_title: formData.mission_title,
            mission_description: formData.mission_description,
            location: formData.location,
            needed_actor: formData.needed_actor,
            actor_specialization: formData.actor_specialization,
            other_actor_specialization: formData.other_actor_specialization,
            needed_actor_amount: formData.needed_actor_amount,
            required_experience_level: formData.required_experience_level,
            surface_area: formData.surface_area,
            surface_unit: formData.surface_unit,
            equipment: formData.equipment,
            proposed_advantages: formData.proposed_advantages,
            personalized_expression: formData.personalized_expression,
          }}
          onSaved={handleQuickStartSaved}
        />
      )}
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
  content: {
    flex: 1,
  },
});
