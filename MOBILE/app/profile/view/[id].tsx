import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Star,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useRatingStore } from '@/stores/ratings';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ViewProfileScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();
  const { fetchAverageUserRating } = useRatingStore();
  const [profile, setProfile] = useState<any>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch average rating
        const rating = await fetchAverageUserRating(id as string);
        setAverageRating(rating);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Profil non trouvé
        </Text>
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
          {profile.profile_picture ? (
            <Image
              source={{ uri: profile.profile_picture }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.userIconContainer,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <User size={50} color={colors.primary} />
            </View>
          )}

          <Text style={[styles.name, { color: colors.text }]}>
            {profile.full_name}
          </Text>

          <Text style={[styles.role, { color: colors.muted }]}>
            {profile.role === 'worker'
              ? 'Ouvrier'
              : profile.role === 'advisor'
              ? 'Conseiller Agricole'
              : profile.role === 'entrepreneur'
              ? 'Entrepreneur'
              : 'Inconnu'}
          </Text>

          {averageRating !== null && (
            <View style={styles.ratingContainer}>
              <Star size={20} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informations de contact
          </Text>

          {profile.phone && (
            <View style={styles.infoItem}>
              <Phone size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {profile.phone}
              </Text>
            </View>
          )}

          {profile.actual_location && (
            <View style={styles.infoItem}>
              <MapPin size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {profile.actual_location}
              </Text>
            </View>
          )}
        </Animated.View>

        {profile.bio && (
          <Animated.View
            entering={FadeInDown.delay(600)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              À propos
            </Text>
            <Text style={[styles.bioText, { color: colors.text }]}>
              {profile.bio}
            </Text>
          </Animated.View>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(800)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Compétences
            </Text>
            <View style={styles.tagsContainer}>
              {profile.skills.map((skill: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(1000)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Langues
            </Text>
            <View style={styles.tagsContainer}>
              {profile.languages.map((language: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.success + '20' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.success }]}>
                    {language}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  role: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  bioText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});
