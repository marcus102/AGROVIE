import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Star, Send, User } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useRatingStore } from '@/stores/ratings';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RatingScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();
  const { createUserRating, canRateMission, loading } = useRatingStore();
  const { user, profile } = useAuthStore();
  const { fetchMissionByID } = useMissionStore();
  
  const [mission, setMission] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingType, setRatingType] = useState<'employer_to_employee' | 'employee_to_employer'>('employee_to_employer');
  const [ratedUserId, setRatedUserId] = useState<string>('');
  const [canRate, setCanRate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeRating = async () => {
      if (!id || !user?.id) return;

      try {
        // Fetch mission details
        const missionData = await fetchMissionByID(id as string);
        if (missionData) {
          setMission(missionData);
          
          // Determine rating type and rated user
          if (missionData.user_id === user.id) {
            // Current user is the employer
            setRatingType('employer_to_employee');
            // For simplicity, we'll need to get the employee ID from mission applicants
            // In a real app, you'd have a proper employee assignment system
            if (missionData.applicants && missionData.applicants.length > 0) {
              setRatedUserId(missionData.applicants[0]);
            }
          } else {
            // Current user is an employee
            setRatingType('employee_to_employer');
            setRatedUserId(missionData.user_id);
          }
        }

        // Check if user can rate this mission
        const eligible = await canRateMission(id as string, user.id);
        setCanRate(eligible);
      } catch (error) {
        console.error('Error initializing rating:', error);
        Alert.alert('Erreur', 'Impossible de charger les informations de la mission');
      }
    };

    initializeRating();
  }, [id, user?.id]);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmitRating = async () => {
    if (!rating) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    if (!ratedUserId) {
      Alert.alert('Erreur', 'Utilisateur à évaluer non trouvé');
      return;
    }

    setSubmitting(true);
    try {
      await createUserRating({
        mission_id: id as string,
        rater_id: user!.id,
        rated_user_id: ratedUserId,
        rating,
        comment: comment.trim() || null,
        rating_type: ratingType,
      });

      Alert.alert(
        'Succès',
        'Votre évaluation a été soumise avec succès',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre votre évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Star
              size={40}
              color={star <= rating ? colors.warning : colors.muted}
              fill={star <= rating ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!canRate) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.messageContainer}>
          <Text style={[styles.messageTitle, { color: colors.text }]}>
            Évaluation non disponible
          </Text>
          <Text style={[styles.messageText, { color: colors.muted }]}>
            Vous ne pouvez pas évaluer cette mission pour le moment. 
            L'évaluation n'est disponible qu'après la fin de la mission.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <User size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Évaluer la mission
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {mission?.mission_title}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)} 
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {ratingType === 'employer_to_employee' 
              ? 'Évaluer votre employé' 
              : 'Évaluer votre employeur'}
          </Text>
          
          <Text style={[styles.ratingLabel, { color: colors.text }]}>
            Note générale
          </Text>
          {renderStars()}
          
          <Text style={[styles.ratingText, { color: colors.muted }]}>
            {rating === 0 && 'Sélectionnez une note'}
            {rating === 1 && 'Très insatisfait'}
            {rating === 2 && 'Insatisfait'}
            {rating === 3 && 'Neutre'}
            {rating === 4 && 'Satisfait'}
            {rating === 5 && 'Très satisfait'}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600)} 
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Commentaire (optionnel)
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Partagez votre expérience..."
            placeholderTextColor={colors.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)} style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: rating > 0 ? colors.primary : colors.muted }
            ]}
            onPress={handleSubmitRating}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Send size={20} color={colors.card} />
                <Text style={[styles.submitButtonText, { color: colors.card }]}>
                  Soumettre l'évaluation
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 20,
  },
  ratingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 120,
  },
  submitContainer: {
    marginBottom: 32,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});