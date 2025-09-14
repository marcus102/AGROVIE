import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Leaf,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { BaseModal } from '@/components/modals/BaseModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeOverlayProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

const keyFeatures = [
  {
    icon: Users,
    title: 'Réseau Professionnel',
    description: 'Connectez-vous avec des experts agricoles certifiés et des entrepreneurs innovants',
    gradient: ['#3B82F6', '#1E40AF'] as const,
  },
  {
    icon: Shield,
    title: 'Sécurité Garantie',
    description: 'Profils vérifiés, paiements sécurisés et protection complète des données',
    gradient: ['#10B981', '#059669'] as const,
  },
  {
    icon: TrendingUp,
    title: 'Croissance Assurée',
    description: 'Outils avancés pour optimiser vos performances et développer votre activité',
    gradient: ['#F59E0B', '#D97706'] as const,
  },
] as const;

const onboardingSteps = [
  {
    icon: Target,
    title: 'Définissez votre profil',
    description: 'Renseignez vos compétences, expériences et objectifs professionnels',
    color: '#6366F1',
  },
  {
    icon: Users,
    title: 'Explorez les opportunités',
    description: 'Découvrez des missions, projets et collaborations adaptés à votre profil',
    color: '#10B981',
  },
  {
    icon: Award,
    title: 'Développez votre réseau',
    description: 'Établissez des relations durables et développez votre expertise',
    color: '#F59E0B',
  },
];

export function WelcomeOverlay({
  visible,
  onClose,
  userName,
}: WelcomeOverlayProps) {
  const { colors } = useThemeStore();
  const [currentPage, setCurrentPage] = useState<'welcome' | 'features' | 'onboarding'>('welcome');

  const handleNext = useCallback(() => {
    if (currentPage === 'welcome') {
      setCurrentPage('features');
    } else if (currentPage === 'features') {
      setCurrentPage('onboarding');
    } else {
      onClose();
    }
  }, [currentPage, onClose]);

  const handleClose = useCallback(() => {
    setCurrentPage('welcome');
    onClose();
  }, [onClose]);

  const renderWelcomePage = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.pageContainer}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[colors?.primary || '#3B82F6', (colors?.primary || '#3B82F6') + '80']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoContainer}>
            <Leaf size={40} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>
            Bienvenue sur AGRO
            {userName && (
              <Text style={styles.userNameText}>{'\n'}{userName}</Text>
            )}
          </Text>
          <Text style={[styles.heroSubtitle, { color: '#FFFFFF' + 'E6' }]}>
            La plateforme qui révolutionne l'écosystème agricole
          </Text>
        </LinearGradient>
      </View>

      {/* Mission Statement */}
      <View style={[styles.sectionCard, { backgroundColor: colors?.background || '#FFFFFF' }]}>
        <View style={styles.betaNotice}>
          <View style={[styles.betaBadge, { backgroundColor: (colors?.warning || '#F59E0B') + '20' }]}>
            <Zap size={16} color={colors?.warning || '#F59E0B'} />
            <Text style={[styles.betaText, { color: colors?.warning || '#F59E0B' }]}>
              Version Bêta
            </Text>
          </View>
          <Text style={[styles.betaDescription, { color: colors?.muted || '#6B7280' }]}>
            Votre feedback nous aide à améliorer constamment l'expérience utilisateur
          </Text>
        </View>
      </View>

      {/* Value Proposition */}
      <View style={[styles.sectionCard, { backgroundColor: colors?.background || '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: colors?.text || '#1F2937' }]}>
          Pourquoi AGRO ?
        </Text>
        <Text style={[styles.valueProposition, { color: colors?.muted || '#6B7280' }]}>
          Nous connectons les talents agricoles pour créer un écosystème collaboratif, 
          innovant et durable. Rejoignez une communauté de professionnels passionnés 
          par l'avenir de l'agriculture.
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors?.primary || '#3B82F6' }]}>500+</Text>
            <Text style={[styles.statLabel, { color: colors?.muted || '#6B7280' }]}>Professionnels</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors?.primary || '#3B82F6' }]}>200+</Text>
            <Text style={[styles.statLabel, { color: colors?.muted || '#6B7280' }]}>Projets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors?.primary || '#3B82F6' }]}>95%</Text>
            <Text style={[styles.statLabel, { color: colors?.muted || '#6B7280' }]}>Satisfaction</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderFeaturesPage = () => (
    <Animated.View entering={SlideInRight.duration(500)} style={styles.pageContainer}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors?.text || '#1F2937' }]}>
          Fonctionnalités Clés
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors?.muted || '#6B7280' }]}>
          Découvrez tout ce qu'AGRO peut faire pour vous
        </Text>
      </View>

      {keyFeatures.map((feature, index) => (
        <Animated.View
          key={feature.title}
          entering={FadeInDown.delay(index * 200).duration(600)}
          layout={Layout.springify()}
          style={[styles.featureCard, { backgroundColor: colors?.background || '#FFFFFF' }]}
        >
          <LinearGradient
            colors={feature.gradient}
            style={styles.featureIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <feature.icon size={28} color="#FFFFFF" strokeWidth={2} />
          </LinearGradient>
          
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors?.text || '#1F2937' }]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureDescription, { color: colors?.muted || '#6B7280' }]}>
              {feature.description}
            </Text>
          </View>

          <View style={[styles.featureArrow, { backgroundColor: colors?.border || '#E5E7EB' }]}>
            <ArrowRight size={16} color={colors?.muted || '#6B7280'} />
          </View>
        </Animated.View>
      ))}

      <View style={[styles.trustSection, { backgroundColor: (colors?.primary || '#3B82F6') + '10' }]}>
        <Check size={20} color={colors?.primary || '#3B82F6'} />
        <Text style={[styles.trustText, { color: colors?.primary || '#3B82F6' }]}>
          Plateforme certifiée et approuvée par les professionnels du secteur
        </Text>
      </View>
    </Animated.View>
  );

  const renderOnboardingPage = () => (
    <Animated.View entering={SlideInRight.duration(500)} style={styles.pageContainer}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors?.text || '#1F2937' }]}>
          Commencez Votre Parcours
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors?.muted || '#6B7280' }]}>
          3 étapes simples pour maximiser votre expérience
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        {onboardingSteps.map((step, index) => (
          <Animated.View
            key={step.title}
            entering={FadeInDown.delay(index * 150).duration(600)}
            style={[styles.stepCard, { backgroundColor: colors?.background || '#FFFFFF' }]}
          >
            <View style={styles.stepLeft}>
              <View style={[styles.stepIconContainer, { backgroundColor: step.color + '20' }]}>
                <step.icon size={24} color={step.color} strokeWidth={2} />
              </View>
              <View style={[styles.stepConnector, { 
                backgroundColor: index < onboardingSteps.length - 1 ? (colors?.border || '#E5E7EB') : 'transparent' 
              }]} />
            </View>
            
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors?.text || '#1F2937' }]}>
                {step.title}
              </Text>
              <Text style={[styles.stepDescription, { color: colors?.muted || '#6B7280' }]}>
                {step.description}
              </Text>
            </View>

            <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.readySection, { backgroundColor: (colors?.primary || '#3B82F6') + '15' }]}>
        <LinearGradient
          colors={[colors?.primary || '#3B82F6', (colors?.primary || '#3B82F6') + '80']}
          style={styles.readyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.readyTitle, { color: '#FFFFFF' }]}>
            Prêt à transformer votre carrière agricole ?
          </Text>
          <Text style={[styles.readySubtitle, { color: '#FFFFFF' + 'CC' }]}>
            Rejoignez dès maintenant la communauté AGRO et découvrez de nouvelles opportunités
          </Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  const getPageProgress = () => {
    switch (currentPage) {
      case 'welcome': return 0;
      case 'features': return 1;
      case 'onboarding': return 2;
      default: return 0;
    }
  };

  const getButtonText = () => {
    switch (currentPage) {
      case 'welcome': return 'Découvrir';
      case 'features': return 'Continuer';
      case 'onboarding': return 'Commencer';
      default: return 'Suivant';
    }
  };

  // Ensure colors object exists with fallbacks
  const safeColors = {
    card: colors?.card || '#FFFFFF',
    border: colors?.border || '#E5E7EB',
    primary: colors?.primary || '#3B82F6',
    text: colors?.text || '#1F2937',
    muted: colors?.muted || '#6B7280',
    background: colors?.background || '#FFFFFF',
    warning: colors?.warning || '#F59E0B',
  };

  return (
    <BaseModal visible={visible} onClose={handleClose}>
      {/* Header */}
      <View style={[styles.modalHeader, { borderBottomColor: safeColors.border }]}>
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: getPageProgress() >= index ? safeColors.primary : safeColors.border,
                  transform: [{ scale: getPageProgress() === index ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentPage === 'welcome' && renderWelcomePage()}
        {currentPage === 'features' && renderFeaturesPage()}
        {currentPage === 'onboarding' && renderOnboardingPage()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.modalFooter, { borderTopColor: safeColors.border }]}>
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: safeColors.border }]}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={[styles.skipButtonText, { color: safeColors.muted }]}>
            Ignorer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: safeColors.primary }]}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>
            {getButtonText()}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContainer: {
    maxHeight: screenHeight * 0.7,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  pageContainer: {
    padding: 20,
    minHeight: screenHeight * 0.4,
  },
  heroSection: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  userNameText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    fontSize: 22,
  },
  heroSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
  },
  betaNotice: {
    alignItems: 'center',
  },
  betaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  betaText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    fontSize: 14,
  },
  betaDescription: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  valueProposition: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
    fontSize: 12,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    minHeight: 88,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
  },
  featureArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  trustText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    minHeight: 96,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    width: 2,
    height: 40,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  stepDescription: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  readySection: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  readyGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  readyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  readySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: 'normal',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    minHeight: 72,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  skipButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minHeight: 48,
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});