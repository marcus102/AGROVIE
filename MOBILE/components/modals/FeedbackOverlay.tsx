import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  MessageCircle,
  Star,
  Send,
  CheckCircle,
  User,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { Toast, ToastType } from '@/components/Toast';
import { BaseModal } from '@/components/modals/BaseModal';
import Constants from 'expo-constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


interface FeedbackOverlayProps {
  visible: boolean;
  onClose: () => void;
}

type FeedbackStep = 'rating' | 'details' | 'success';

const FEEDBACK_CATEGORIES = [
  { id: 'ui', label: 'Interface & Navigation', icon: '🎨' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'features', label: 'Fonctionnalités', icon: '✨' },
  { id: 'bug', label: 'Bug Report', icon: '🐛' },
  { id: 'other', label: 'Autre', icon: '💭' },
];

export function FeedbackOverlay({ visible, onClose }: FeedbackOverlayProps) {
  const { colors } = useThemeStore();
  const { profile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<FeedbackStep>('rating');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  const hideToast = () => setToastVisible(false);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      // Reset all state when modal is closed
      setTimeout(() => {
        setCurrentStep('rating');
        setFeedback('');
        setRating(0);
        setSelectedCategory('');
        setIsSubmitting(false);
      }, 300); // Wait for animation to complete
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      showToast('error', 'Veuillez saisir votre commentaire');
      return;
    }

    if (rating === 0) {
      showToast('error', 'Veuillez donner une note');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedbacks').insert([
        {
          user_name: profile?.full_name || 'Utilisateur anonyme',
          user_role: profile?.role || 'unknown',
          feedback_text: feedback.trim(),
          rating: rating,
          category: selectedCategory,
          app_version: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS,
          user_agent: Platform.OS === 'web' ? navigator.userAgent : undefined,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setCurrentStep('success');

      // Auto close after success
      setTimeout(() => {
        handleClose(true);
      }, 2500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('error', "Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (skipConfirmation = false) => {
    const hasContent = feedback.trim() || rating > 0 || selectedCategory;

    if (!skipConfirmation && hasContent && currentStep !== 'success') {
      Alert.alert(
        'Abandonner le feedback ?',
        'Vos modifications seront perdues.',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: () => onClose(),
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (rating === 0) {
      showToast('error', 'Veuillez donner une note');
      return;
    }
    setCurrentStep('details');
  };

  const handleBack = () => {
    setCurrentStep('rating');
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Star
              size={28}
              color={
                star <= rating
                  ? '#FFD700'
                  : colors.border || '#e5e7eb'
              }
              fill={
                star <= rating ? '#FFD700' : 'transparent'
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingDescription = () => {
    const descriptions = [
      '',
      'Très insatisfait - Beaucoup d\'améliorations nécessaires',
      'Insatisfait - Plusieurs problèmes rencontrés',
      'Neutre - Expérience correcte mais peut mieux faire',
      'Satisfait - Bonne expérience globale',
      'Très satisfait - Expérience excellente !'
    ];
    return descriptions[rating];
  };

  const renderRatingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Comment évaluez-vous votre expérience ?
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
          Votre avis nous aide à améliorer AGRO
        </Text>
      </View>

      <View style={styles.ratingSection}>
        {renderStars()}

        {rating > 0 && (
          <View style={styles.ratingDescription}>
            <Text style={[styles.ratingDescriptionText, { color: colors.muted }]}>
              {getRatingDescription()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stepActions}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: rating > 0 ? colors.primary : colors.muted,
              opacity: rating > 0 ? 1 : 0.6,
            },
          ]}
          onPress={handleNext}
          disabled={rating === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Partagez vos commentaires
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
          Aidez-nous à comprendre votre expérience
        </Text>
      </View>

      {/* Category Selection */}
      <View style={styles.categorySection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Catégorie (optionnel)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {FEEDBACK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category.id
                    ? colors.primary + '20'
                    : colors.background,
                  borderColor: selectedCategory === category.id
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color: selectedCategory === category.id
                      ? colors.primary
                      : colors.text,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feedback Text */}
      <View style={styles.feedbackSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Votre commentaire
        </Text>
        <View
          style={[
            styles.textAreaContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder="Décrivez votre expérience, signalez des problèmes ou suggérez des améliorations..."
            placeholderTextColor={colors.muted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
            editable={!isSubmitting}
          />
          <View style={styles.characterCount}>
            <Text
              style={[
                styles.characterCountText,
                {
                  color: feedback.length > 450 ? colors.error : colors.muted,
                },
              ]}
            >
              {feedback.length}/500
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.stepActions}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handleBack}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Retour
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: feedback.trim() && !isSubmitting
                ? colors.primary
                : colors.muted,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!feedback.trim() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.primaryButtonText}>Envoi...</Text>
          ) : (
            <View style={styles.buttonContent}>
              <Send size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Envoyer</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View
        style={[
          styles.successIcon,
          { backgroundColor: colors.success + '20' },
        ]}
      >
        <CheckCircle size={48} color={colors.success} />
      </View>

      <Text style={[styles.successTitle, { color: colors.text }]}>
        Merci pour votre retour !
      </Text>

      <Text style={[styles.successMessage, { color: colors.muted }]}>
        Votre feedback a été envoyé avec succès. Il nous aidera à améliorer
        votre expérience avec AGRO.
      </Text>
    </View>
  );

  const getProgressWidth = () => {
    switch (currentStep) {
      case 'rating': return '33%';
      case 'details': return '66%';
      case 'success': return '100%';
      default: return '0%';
    }
  };

  return (
    <>
      <BaseModal visible={visible} onClose={() => handleClose()}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border || '#e5e7eb' }]}>
          <View style={styles.headerContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: (colors.primary || '#007AFF') + '15' },
              ]}
            >
              <MessageCircle size={20} color={colors.primary || '#007AFF'} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text || '#000000' }]}>
                Feedback
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted || '#666666' }]}>
                Version {Constants.expoConfig?.version || '1.0.0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        {currentStep !== 'success' && (
          <View style={[styles.progressContainer, { backgroundColor: colors.background || '#f5f5f5' }]}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary || '#007AFF',
                  width: getProgressWidth(),
                },
              ]}
            />
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 'rating' && renderRatingStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </ScrollView>
      </BaseModal>

      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60, // Account for close button
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  progressContainer: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    // flex: 1,
    maxHeight: screenHeight * 0.7,
  },
  stepContainer: {
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  starButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  ratingDescription: {
    paddingHorizontal: 20,
  },
  ratingDescriptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    minHeight: 36,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  feedbackSection: {
    marginBottom: 32,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    position: 'relative',
    minHeight: 120,
  },
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    padding: 16,
    paddingBottom: 40,
    lineHeight: 22,
    minHeight: 120,
  },
  characterCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  characterCountText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
  },
  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 52,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});