import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const steps = [
  {
    title: 'Vérification des documents',
    description: 'Nous vérifions l\'authenticité de vos documents',
    duration: '24-48h',
  },
  {
    title: 'Validation du profil',
    description: 'Examen de votre profil par notre équipe',
    duration: '24h',
  },
  {
    title: 'Activation du compte',
    description: 'Accès complet à la plateforme',
    duration: 'Immédiat',
  },
];

export default function ConfirmationScreen() {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.header}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <CheckCircle2 size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Documents envoyés avec succès
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Votre dossier est en cours d'examen. Nous vous tiendrons informé de l'avancement.
          </Text>
        </Animated.View>

        <View style={styles.progress}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View 
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '100%' }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            Étape 4 sur 4
          </Text>
        </View>

        <View style={styles.timeline}>
          {steps.map((step, index) => (
            <Animated.View
              key={step.title}
              entering={FadeInDown.delay(300 + index * 100)}
              style={[
                styles.timelineItem,
                { backgroundColor: colors.card }
              ]}
            >
              <View style={styles.timelineHeader}>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.timelineDuration, { color: colors.primary }]}>
                  {step.duration}
                </Text>
              </View>
              <Text style={[styles.timelineDescription, { color: colors.muted }]}>
                {step.description}
              </Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={[styles.infoCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Que se passe-t-il ensuite ?
          </Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Vous recevrez des notifications par email à chaque étape du processus. En attendant, vous pouvez en apprendre plus sur notre plateforme.
          </Text>
        </Animated.View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('https://www.agro.com/about')}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>
              En savoir plus
            </Text>
            <ChevronRight size={20} color={colors.card} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Se connecter plus tard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 48,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  progress: {
    marginBottom: 48,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
  },
  timeline: {
    marginBottom: 32,
    gap: 16,
  },
  timelineItem: {
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  timelineDuration: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  timelineDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});