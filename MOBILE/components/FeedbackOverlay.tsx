import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import {
  MessageSquare,
  Star,
  Send,
  X,
  Heart,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Toast, ToastType } from '@/components/Toast';
import Constants from 'expo-constants';

interface FeedbackOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function FeedbackOverlay({ visible, onClose }: FeedbackOverlayProps) {
  const { colors } = useThemeStore();
  const { profile } = useAuthStore();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
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
          app_version: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS,
          user_agent: Platform.OS === 'web' ? navigator.userAgent : undefined,
        },
      ]);

      if (error) throw error;

      showToast(
        'success',
        'Merci pour votre retour ! Votre feedback a été envoyé.'
      );

      // Reset form
      setFeedback('');
      setRating(0);

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('error', "Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (feedback.trim() || rating > 0) {
      Alert.alert(
        'Abandonner le feedback ?',
        'Votre feedback sera perdu si vous fermez maintenant.',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: () => {
              setFeedback('');
              setRating(0);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
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
          >
            <Star
              size={32}
              color={star <= rating ? colors.warning : colors.border}
              fill={star <= rating ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Très insatisfait';
      case 2:
        return 'Insatisfait';
      case 3:
        return 'Neutre';
      case 4:
        return 'Satisfait';
      case 5:
        return 'Très satisfait';
      default:
        return 'Donnez votre note';
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: colors.card }]}>
            {/* Header */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <MessageSquare size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Votre avis compte
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>
                    Aidez-nous à améliorer AGRO
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.border }]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Testing Notice */}
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[
                  styles.testingNotice,
                  { backgroundColor: colors.info + '20' },
                ]}
              >
                <View style={styles.noticeHeader}>
                  <AlertCircle size={20} color={colors.info} />
                  <Text style={[styles.noticeTitle, { color: colors.info }]}>
                    Version de test
                  </Text>
                </View>
                <Text style={[styles.noticeText, { color: colors.text }]}>
                  Cette application est en phase de test. Vos commentaires nous
                  aident à identifier les problèmes et à améliorer l'expérience
                  utilisateur.
                </Text>
              </Animated.View>

              {/* Rating Section */}
              <Animated.View
                entering={FadeInDown.delay(400)}
                style={styles.ratingSection}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Comment évaluez-vous votre expérience ?
                </Text>
                {renderStars()}
                <Text style={[styles.ratingText, { color: colors.muted }]}>
                  {getRatingText()}
                </Text>
              </Animated.View>

              {/* Feedback Section */}
              <Animated.View
                entering={FadeInDown.delay(500)}
                style={styles.feedbackSection}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Partagez vos commentaires
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
                  Décrivez votre expérience, signalez des bugs, ou suggérez des
                  améliorations
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
                    placeholder="Votre feedback est précieux pour nous..."
                    placeholderTextColor={colors.muted}
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                    editable={!isSubmitting}
                  />
                  <View style={styles.characterCount}>
                    <Text
                      style={[
                        styles.characterCountText,
                        { color: colors.muted },
                      ]}
                    >
                      {feedback.length}/1000
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Suggestions */}
              <Animated.View
                entering={FadeInDown.delay(600)}
                style={styles.suggestionsSection}
              >
                <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
                  💡 Suggestions de feedback :
                </Text>
                {[
                  'Interface utilisateur et navigation',
                  "Performance et vitesse de l'app",
                  'Fonctionnalités manquantes',
                  'Bugs ou erreurs rencontrés',
                  "Suggestions d'amélioration",
                ].map((suggestion, index) => (
                  <Text
                    key={index}
                    style={[styles.suggestionItem, { color: colors.muted }]}
                  >
                    • {suggestion}
                  </Text>
                ))}
              </Animated.View>
            </ScrollView>

            {/* Submit Button */}
            <Animated.View
              entering={FadeInDown.delay(700)}
              style={styles.submitSection}
            >
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      feedback.trim() && rating > 0
                        ? colors.primary
                        : colors.muted,
                  },
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!feedback.trim() || rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                ) : (
                  <>
                    <Send size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Envoyer le feedback
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.thankYouNote}>
                <Heart size={16} color={colors.primary} />
                <Text style={[styles.thankYouText, { color: colors.muted }]}>
                  Merci de nous aider à améliorer AGRO !
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>

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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testingNotice: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  noticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    position: 'relative',
  },
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 16,
    minHeight: 120,
    lineHeight: 22,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  characterCountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  suggestionItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  submitSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  thankYouNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  thankYouText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
