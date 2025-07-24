import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Users,
  CircleCheck as CheckCircle2,
  MapPin,
  Zap,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FeaturesSectionProps {
  profile: any;
  colors: any;
}

const features = [
  {
    title: 'Recrutement Simplifié',
    description: 'Trouvez les meilleurs talents agricoles en quelques clics',
    icon: Users,
    color: '#3b82f6',
  },
  {
    title: 'Vérification Complète',
    description: 'Profils et compétences vérifiés pour plus de sécurité',
    icon: CheckCircle2,
    color: '#10b981',
  },
  {
    title: 'Couverture Nationale',
    description: 'Un réseau de professionnels dans tout le Burkina Faso',
    icon: MapPin,
    color: '#f59e0b',
  },
  {
    title: 'Innovation Technologique',
    description: 'Outils modernes pour une agriculture de précision',
    icon: Zap,
    color: '#8b5cf6',
  },
];

export const FeaturesSection = memo(
  ({ profile, colors }: FeaturesSectionProps) => {
    // Show features section for entrepreneurs or when no profile role is set
    if (profile?.role !== 'entrepreneur' && profile?.role) {
      return null;
    }

    return (
      <View style={styles.featuresSection}>
        <Animated.View entering={FadeInDown.delay(800)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pourquoi choisir AGRO ?
          </Text>
        </Animated.View>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.delay(900 + index * 100)}
              style={[styles.featureCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: feature.color + '15' },
                ]}
              >
                <feature.icon size={28} color={feature.color} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[styles.featureDescription, { color: colors.muted }]}
              >
                {feature.description}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 12,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
});
