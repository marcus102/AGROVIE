import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Zap,
  Users,
  Wrench,
  Sprout,
  Tractor,
  ChevronRight,
  Star,
  Clock,
  MapPin,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const missionTemplates = [
  {
    id: 'harvest',
    title: 'Récolte de Céréales',
    description: 'Mission de récolte pour blé, maïs ou autres céréales',
    icon: Sprout,
    color: '#f59e0b',
    estimatedDuration: '3-7 jours',
    defaultLocation: 'Ouagadougou',
    data: {
      mission_title: 'Récolte de Céréales',
      mission_description: 'Recherche d\'ouvriers expérimentés pour la récolte de céréales. Travail en équipe, respect des horaires et des techniques de récolte requis.',
      needed_actor: 'worker' as const,
      actor_specialization: 'crop_production_worker' as const,
      needed_actor_amount: 5,
      required_experience_level: 'qualified' as const,
      surface_area: 10,
      surface_unit: 'hectares' as const,
      equipment: true,
      proposed_advantages: ['meal', 'transport'] as const,
    },
  },
  {
    id: 'maintenance',
    title: 'Maintenance Équipements',
    description: 'Maintenance et réparation d\'équipements agricoles',
    icon: Wrench,
    color: '#3b82f6',
    estimatedDuration: '1-3 jours',
    defaultLocation: 'Bobo-Dioulasso',
    data: {
      mission_title: 'Maintenance Équipements Agricoles',
      mission_description: 'Recherche de techniciens qualifiés pour la maintenance préventive et corrective d\'équipements agricoles. Connaissance des moteurs et systèmes hydrauliques requise.',
      needed_actor: 'technician' as const,
      actor_specialization: 'agricultural_equipment_technician' as const,
      needed_actor_amount: 2,
      required_experience_level: 'expert' as const,
      surface_area: 0,
      surface_unit: 'hectares' as const,
      equipment: false,
      proposed_advantages: ['meal', 'performance_bonus'] as const,
    },
  },
  {
    id: 'planting',
    title: 'Plantation de Cultures',
    description: 'Plantation et semis de nouvelles cultures',
    icon: Tractor,
    color: '#10b981',
    estimatedDuration: '2-5 jours',
    defaultLocation: 'Koudougou',
    data: {
      mission_title: 'Plantation de Cultures Maraîchères',
      mission_description: 'Mission de plantation pour cultures maraîchères. Préparation du sol, semis et plantation selon les techniques appropriées.',
      needed_actor: 'worker' as const,
      actor_specialization: 'crop_production_worker' as const,
      needed_actor_amount: 8,
      required_experience_level: 'starter' as const,
      surface_area: 5,
      surface_unit: 'hectares' as const,
      equipment: true,
      proposed_advantages: ['meal', 'transport', 'accommodation'] as const,
    },
  },
  {
    id: 'livestock',
    title: 'Soins aux Animaux',
    description: 'Soins et gestion du bétail',
    icon: Users,
    color: '#8b5cf6',
    estimatedDuration: '1-2 semaines',
    defaultLocation: 'Banfora',
    data: {
      mission_title: 'Soins et Gestion du Bétail',
      mission_description: 'Recherche d\'ouvriers spécialisés en élevage pour soins quotidiens, alimentation et surveillance sanitaire du bétail.',
      needed_actor: 'worker' as const,
      actor_specialization: 'livestock_worker' as const,
      needed_actor_amount: 3,
      required_experience_level: 'qualified' as const,
      surface_area: 0,
      surface_unit: 'hectares' as const,
      equipment: false,
      proposed_advantages: ['meal', 'accommodation'] as const,
    },
  },
];

export default function NewMissionLandingScreen() {
  const { colors } = useThemeStore();
  const { setDraftMission } = useMissionStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateFromScratch = () => {
    setDraftMission(null);
    router.push('/new/create');
  };

  const handleUseTemplate = (template: typeof missionTemplates[0]) => {
    setSelectedTemplate(template.id);
    setDraftMission({
      ...template.data,
      proposed_advantages: [...template.data.proposed_advantages],
    });
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      router.push('/new/create');
    }, 300);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={{
            uri: 'https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/agriculture_potirons_loumbi.jpg',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.heroTitle}>Créer une Mission</Text>
            <Text style={styles.heroSubtitle}>
              Trouvez les meilleurs talents agricoles pour vos projets
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Quick Start Section */}
      <View style={styles.quickStartSection}>
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Démarrage rapide
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Choisissez comment vous souhaitez créer votre mission
          </Text>
        </Animated.View>

        {/* Create from Scratch Button */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleCreateFromScratch}
          >
            <View style={styles.createButtonContent}>
              <View
                style={[
                  styles.createButtonIcon,
                  { backgroundColor: colors.card + '20' },
                ]}
              >
                <Plus size={28} color={colors.card} />
              </View>
              <View style={styles.createButtonText}>
                <Text style={[styles.createButtonTitle, { color: colors.card }]}>
                  Créer depuis zéro
                </Text>
                <Text style={[styles.createButtonSubtitle, { color: colors.card + 'CC' }]}>
                  Personnalisez entièrement votre mission
                </Text>
              </View>
              <ChevronRight size={24} color={colors.card} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Templates Section */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Text style={[styles.templatesTitle, { color: colors.text }]}>
            Ou utilisez un modèle prédéfini
          </Text>
          <Text style={[styles.templatesSubtitle, { color: colors.muted }]}>
            Gagnez du temps avec nos modèles optimisés
          </Text>
        </Animated.View>

        <View style={styles.templatesGrid}>
          {missionTemplates.map((template, index) => (
            <Animated.View
              key={template.id}
              entering={FadeInDown.delay(800 + index * 100)}
            >
              <TouchableOpacity
                style={[
                  styles.templateCard,
                  { backgroundColor: colors.card },
                  selectedTemplate === template.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleUseTemplate(template)}
              >
                <View style={styles.templateHeader}>
                  <View
                    style={[
                      styles.templateIcon,
                      { backgroundColor: template.color + '20' },
                    ]}
                  >
                    <template.icon size={24} color={template.color} />
                  </View>
                  <View style={styles.templateBadge}>
                    <Zap size={12} color={colors.primary} />
                    <Text style={[styles.templateBadgeText, { color: colors.primary }]}>
                      Rapide
                    </Text>
                  </View>
                </View>

                <Text style={[styles.templateTitle, { color: colors.text }]}>
                  {template.title}
                </Text>
                <Text style={[styles.templateDescription, { color: colors.muted }]}>
                  {template.description}
                </Text>

                <View style={styles.templateMeta}>
                  <View style={styles.templateMetaItem}>
                    <Clock size={14} color={colors.muted} />
                    <Text style={[styles.templateMetaText, { color: colors.muted }]}>
                      {template.estimatedDuration}
                    </Text>
                  </View>
                  <View style={styles.templateMetaItem}>
                    <MapPin size={14} color={colors.muted} />
                    <Text style={[styles.templateMetaText, { color: colors.muted }]}>
                      {template.defaultLocation}
                    </Text>
                  </View>
                </View>

                <View style={styles.templateFooter}>
                  <Text style={[styles.templateUseText, { color: colors.primary }]}>
                    Utiliser ce modèle
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Tips Section */}
      <Animated.View
        entering={FadeInDown.delay(1200)}
        style={[styles.tipsSection, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Conseils pour une mission réussie
        </Text>
        <View style={styles.tipsList}>
          {[
            'Soyez précis dans la description de votre mission',
            'Indiquez clairement les compétences requises',
            'Proposez une rémunération attractive',
            'Ajoutez des photos de qualité de votre exploitation',
          ].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View
                style={[
                  styles.tipBullet,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  statsSection: {
    padding: 24,
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  quickStartSection: {
    padding: 24,
  },
  createButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  createButtonText: {
    flex: 1,
  },
  createButtonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  templatesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  templatesSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 24,
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  templateBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  templateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  templateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  templateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  templateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  templateUseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  tipsSection: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});