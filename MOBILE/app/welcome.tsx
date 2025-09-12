import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Leaf, Users, Shield } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default colors fallback
const defaultColors = {
  background: '#ffffff',
  primary: '#22C55E',
  card: '#000000',
};

const slides = [
  {
    id: '1',
    title: 'Bienvenue sur AGROVIE',
    subtitle: 'La plateforme qui connecte les talents agricoles de demain',
    image: require('../assets/img1.jpg'),
    icon: Leaf,
  },
  {
    id: '2',
    title: 'Trouvez les Meilleurs Talents',
    subtitle: 'Accédez à un réseau de professionnels qualifiés et vérifiés',
    image: require('../assets/img2.jpg'),
    icon: Users,
  },
  {
    id: '3',
    title: 'En Toute Sécurité',
    subtitle: 'Profils vérifiés et paiements sécurisés pour votre tranquillité',
    image: require('../assets/img3.jpg'),
    icon: Shield,
  },
];

const FIRST_VISIT_KEY = '@agro_has_visited';

export default function WelcomeScreen() {
  const themeStore = useThemeStore();
  const colors = themeStore?.colors || defaultColors;
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    try {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        await AsyncStorage.setItem(FIRST_VISIT_KEY, 'true');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error saving welcome status:', error);
      // Still navigate even if storage fails
      if (currentSlide === slides.length - 1) {
        router.replace('/(auth)/login');
      }
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(FIRST_VISIT_KEY, 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving welcome status:', error);
      // Still navigate even if storage fails
      router.replace('/(auth)/login');
    }
  };

  const handleSignInPress = () => {
    try {
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Erreur', 'Impossible de naviguer vers la page de connexion');
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Image */}
      <View style={styles.imageContainer}>
        <Image
          source={slide.image}
          style={styles.backgroundImage}
          resizeMode="cover"
          onError={(error) => {
            console.error('Image loading error:', error);
          }}
        />
        <View
          style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo and Icon */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[
            styles.logoContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Icon size={48} color={colors.primary} />
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.textContent}
        >
          <Text style={[styles.title, { color: '#fff' }]}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: '#fff' }]}>
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
                  backgroundColor:
                    currentSlide === index
                      ? colors.primary
                      : colors.card + '60',
                  width: currentSlide === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.actions}>
          <TouchableOpacity style={[styles.skipButton]} onPress={handleSkip}>
            <Text style={[styles.skipButtonText, { color: colors.primary }]}>
              Passer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={[styles.nextButtonText, { color: '#fff' }]}>
              {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <ArrowRight size={20} color={'#fff'} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sign In Link */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          style={styles.signInContainer}
        >
          <Text style={[styles.signInText, { color: '#fff' }]}>
            Déjà inscrit ?{' '}
            <Text
              style={[styles.signInLink, { color: colors.primary }]}
              onPress={handleSignInPress}
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
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: 'normal',
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
    fontWeight: '500',
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
    fontWeight: '600',
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: 'normal',
  },
  signInLink: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
});
