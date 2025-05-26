import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Leaf, Users, Shield } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const slides = [
  {
    id: '1',
    title: 'Bienvenue sur AGRO',
    subtitle: 'La plateforme qui connecte les talents agricoles de demain',
    image: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg',
    icon: Leaf,
  },
  {
    id: '2',
    title: 'Trouvez les Meilleurs Talents',
    subtitle: 'Accédez à un réseau de professionnels qualifiés et vérifiés',
    image: 'https://images.pexels.com/photos/2132168/pexels-photo-2132168.jpeg',
    icon: Users,
  },
  {
    id: '3',
    title: 'En Toute Sécurité',
    subtitle: 'Profils vérifiés et paiements sécurisés pour votre tranquillité',
    image: 'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg',
    icon: Shield,
  },
];

export default function WelcomeScreen() {
  const { colors } = useThemeStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width } = useWindowDimensions();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: slide.image }}
          style={styles.backgroundImage}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo and Icon */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}
        >
          <Icon size={48} color={colors.primary} />
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={styles.textContent}
        >
          <Text style={[styles.title, { color: colors.card }]}>
            {slide.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.card }]}>
            {slide.subtitle}
          </Text>
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: currentSlide === index ? colors.primary : colors.card + '60',
                  width: currentSlide === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={styles.actions}
        >
          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: colors.card }]}>
              Passer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={[styles.nextButtonText, { color: colors.card }]}>
              {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <ArrowRight size={20} color={colors.card} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sign In Link */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={styles.signInContainer}
        >
          <Text style={[styles.signInText, { color: colors.card }]}>
            Déjà inscrit ?{' '}
            <Text
              style={[styles.signInLink, { color: colors.primary }]}
              onPress={() => router.replace('/(auth)/login')}
            >
              Se connecter
            </Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  textContent: {
    marginBottom: 48,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  signInLink: {
    fontFamily: 'Inter-SemiBold',
  },
});