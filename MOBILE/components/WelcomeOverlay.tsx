import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Heart, Users, Shield, Zap, ChevronRight, X, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface WelcomeOverlayProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

const features = [
  {
    icon: Users,
    title: 'Connectez-vous',
    description: 'Trouvez les meilleurs talents agricoles ou des opportunités de travail',
    color: '#3b82f6',
  },
  {
    icon: Shield,
    title: 'En toute sécurité',
    description: 'Profils vérifiés et transactions sécurisées pour votre tranquillité',
    color: '#10b981',
  },
  {
    icon: Zap,
    title: 'Efficace',
    description: 'Processus simplifié pour un recrutement rapide et efficace',
    color: '#f59e0b',
  },
];

const steps = [
  {
    step: 1,
    title: 'Complétez votre profil',
    description: 'Ajoutez vos compétences et expériences',
  },
  {
    step: 2,
    title: 'Explorez les opportunités',
    description: 'Découvrez les missions disponibles',
  },
  {
    step: 3,
    title: 'Connectez-vous',
    description: 'Commencez à collaborer avec la communauté',
  },
];

export function WelcomeOverlay({ visible, onClose, userName }: WelcomeOverlayProps) {
  const { colors } = useThemeStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {currentStep === 0 && (
              <Animated.View entering={FadeInUp.delay(200)}>
                {/* Header */}
                <View style={styles.header}>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    style={styles.logoContainer}
                  >
                    <Heart size={32} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    Bienvenue{userName ? ` ${userName}` : ''} !
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
                    Découvrez AGRO, votre plateforme de connexion agricole
                  </Text>
                </View>

                {/* Testing Notice */}
                <Animated.View
                  entering={FadeInDown.delay(400)}
                  style={[styles.testingNotice, { backgroundColor: colors.warning + '20' }]}
                >
                  <View style={styles.testingHeader}>
                    <Zap size={20} color={colors.warning} />
                    <Text style={[styles.testingTitle, { color: colors.warning }]}>
                      Version de test
                    </Text>
                  </View>
                  <Text style={[styles.testingText, { color: colors.text }]}>
                    Cette application est actuellement en phase de test. Vos retours sont précieux 
                    pour nous aider à améliorer l'expérience utilisateur.
                  </Text>
                </Animated.View>

                {/* Features */}
                <View style={styles.featuresSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Pourquoi choisir AGRO ?
                  </Text>
                  {features.map((feature, index) => (
                    <Animated.View
                      key={feature.title}
                      entering={FadeInDown.delay(600 + index * 100)}
                      style={[styles.featureItem, { backgroundColor: colors.background }]}
                    >
                      <View
                        style={[
                          styles.featureIcon,
                          { backgroundColor: feature.color + '20' },
                        ]}
                      >
                        <feature.icon size={24} color={feature.color} />
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={[styles.featureTitle, { color: colors.text }]}>
                          {feature.title}
                        </Text>
                        <Text style={[styles.featureDescription, { color: colors.muted }]}>
                          {feature.description}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {currentStep === 1 && (
              <Animated.View entering={FadeInUp.delay(200)}>
                {/* Mission Statement */}
                <View style={styles.header}>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    Notre Mission
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
                    Révolutionner l'agriculture grâce à la technologie
                  </Text>
                </View>

                <Animated.View
                  entering={FadeInDown.delay(400)}
                  style={[styles.missionContent, { backgroundColor: colors.background }]}
                >
                  <Text style={[styles.missionText, { color: colors.text }]}>
                    AGRO connecte les professionnels agricoles pour créer un écosystème 
                    collaboratif et innovant. Nous facilitons les rencontres entre 
                    entrepreneurs, techniciens et ouvriers qualifiés.
                  </Text>
                  
                  <View style={styles.valuesContainer}>
                    <Text style={[styles.valuesTitle, { color: colors.text }]}>
                      Nos valeurs :
                    </Text>
                    {[
                      'Innovation technologique',
                      'Développement durable',
                      'Collaboration communautaire',
                      'Excellence professionnelle',
                    ].map((value, index) => (
                      <Animated.View
                        key={value}
                        entering={FadeInDown.delay(600 + index * 100)}
                        style={styles.valueItem}
                      >
                        <CheckCircle size={16} color={colors.success} />
                        <Text style={[styles.valueText, { color: colors.text }]}>
                          {value}
                        </Text>
                      </Animated.View>
                    ))}
                  </View>
                </Animated.View>
              </Animated.View>
            )}

            {currentStep === 2 && (
              <Animated.View entering={FadeInUp.delay(200)}>
                {/* Getting Started */}
                <View style={styles.header}>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    Commencez votre parcours
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
                    Suivez ces étapes simples pour tirer le meilleur parti d'AGRO
                  </Text>
                </View>

                <View style={styles.stepsContainer}>
                  {steps.map((step, index) => (
                    <Animated.View
                      key={step.step}
                      entering={FadeInDown.delay(400 + index * 100)}
                      style={[styles.stepItem, { backgroundColor: colors.background }]}
                    >
                      <View
                        style={[
                          styles.stepNumber,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.stepNumberText}>{step.step}</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: colors.text }]}>
                          {step.title}
                        </Text>
                        <Text style={[styles.stepDescription, { color: colors.muted }]}>
                          {step.description}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>

                <Animated.View
                  entering={FadeInDown.delay(800)}
                  style={[styles.finalMessage, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.finalMessageText, { color: colors.primary }]}>
                    Prêt à transformer votre expérience agricole ? 
                    Explorez dès maintenant les opportunités qui vous attendent !
                  </Text>
                </Animated.View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigation}>
            <View style={styles.progressDots}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        currentStep === index ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.border }]}
                onPress={handleSkip}
              >
                <Text style={[styles.skipButtonText, { color: colors.text }]}>
                  Passer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === 2 ? 'Commencer' : 'Suivant'}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  testingNotice: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  testingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  testingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  missionContent: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  missionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  valuesContainer: {
    marginTop: 16,
  },
  valuesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  finalMessage: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  finalMessageText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigation: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});