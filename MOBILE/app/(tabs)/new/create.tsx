import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Calendar,
  Users,
  FileText,
  Briefcase,
  AlertCircle,
  PenTool as Tool,
  Info,
  Truck,
  Coffee,
  Home,
  Star,
} from 'lucide-react-native';
import { useMissionStore } from '@/stores/mission';
import { usePermissions } from '@/hooks/usePermissions';
import { useThemeStore } from '@/stores/theme';
import {
  Roles,
  ExperienceLevel,
  AdvantageType,
  PriceStatus,
} from '@/types/mission';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const SURFACE_UNITS = [
  { id: 'm²', label: 'mètres carrés (m²)' },
  { id: 'hectares', label: 'hectares' },
  { id: 'acres', label: 'acres' },
  { id: 'km²', label: 'kilomètres carrés (km²)' },
];

const SURFACE_UNIT_CONVERSION = {
  'm²': 1,
  hectares: 10000,
  acres: 4046.86,
  'km²': 1000000,
};

type Step =
  | 'basics'
  | 'logistics'
  | 'requirements'
  | 'pricing'
  | 'review'
  | 'images';

const EXPERIENCE_LEVELS = [
  { id: 'starter', label: 'Débutant', multiplier: 1.0 },
  { id: 'qualified', label: 'Qualifié', multiplier: 1.2 },
  { id: 'expert', label: 'Expert', multiplier: 1.5 },
];

const ADVANTAGES = [
  { id: 'transport', label: 'Transport', icon: Truck, reduction: 5000 },
  {
    id: 'performance_bonus',
    label: 'Primes de rendement',
    icon: Star,
    addition: 2000,
  },
  { id: 'meal', label: 'Repas fournis', icon: Coffee, reduction: 3000 },
  { id: 'accommodation', label: 'Hébergement', icon: Home, reduction: 8000 },
];

// Configuration for price calculation
const PRICE_CONFIG = {
  experienceMultipliers: {
    starter: 1.0,
    qualified: 1.2,
    expert: 1.5,
  },
  operationalCosts: {
    equipment: 5000, // Cost if equipment is not provided
    surface: 2, // Cost per m²
  },
};

function CreateJobScreen() {
  const { canPostJob, isAdmin, isEntrepreneur, isTechnician } =
    usePermissions();
  const { draftMission, updateDraftMission, createMission, loading, error } =
    useMissionStore();
  const { colors } = useThemeStore();
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [availableRoles, setAvailableRoles] = useState<Roles[]>(() => {
    if (isAdmin()) return ['technician', 'worker', 'entrepreneur'];
    return ['technician', 'worker'];
  });

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    draftMission?.required_experience_level || 'starter'
  );
  const [providesEquipment, setProvidesEquipment] = useState(
    draftMission?.equipment || false
  );
  const [selectedAdvantages, setSelectedAdvantages] = useState<AdvantageType>(
    draftMission?.proposed_advantages || []
  );
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const calculateBasePrice = () => {
    const baseRate =
      draftMission?.needed_actor === 'technician' ? 30000 : 20000;
    const duration = calculateDuration();
    const workers = draftMission?.needed_actor_amount || 1;
    const experienceMultiplier =
      PRICE_CONFIG.experienceMultipliers[experienceLevel];

    return baseRate * duration * workers * experienceMultiplier;
  };

  const calculateDuration = () => {
    if (!draftMission?.start_date || !draftMission?.end_date) return 1;

    // Helper to parse date strings
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return new Date(`${fullYear}-${month}-${day}`);
    };

    const start = parseDate(draftMission.start_date);
    const end = parseDate(draftMission.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  };

  const calculateAdjustments = () => {
    let adjustment = 0;
    const workers = draftMission?.needed_actor_amount || 1;

    // Equipment cost
    const equipmentCost = providesEquipment
      ? 0
      : PRICE_CONFIG.operationalCosts.equipment;
    adjustment += equipmentCost;

    // Surface cost
    if (draftMission?.surface_area && draftMission?.surface_unit) {
      const convertedSurface =
        draftMission.surface_area *
        SURFACE_UNIT_CONVERSION[
          draftMission.surface_unit as keyof typeof SURFACE_UNIT_CONVERSION
        ];
      adjustment += convertedSurface * PRICE_CONFIG.operationalCosts.surface;
    }

    // Advantages
    selectedAdvantages.forEach((advantageId) => {
      const advantage = ADVANTAGES.find((a) => a.id === advantageId);
      if (advantage) {
        adjustment += (advantage.addition || 0) * workers;
        adjustment -= (advantage.reduction || 0) * workers;
      }
    });

    return adjustment;
  };

  const calculateFinalPrice = () => {
    const basePrice = calculateBasePrice();
    const adjustments = calculateAdjustments();
    const manualAdjustment = basePrice * (priceAdjustment / 100);

    // Ensure final price never goes below 0
    return Math.max(0, basePrice + adjustments + manualAdjustment);
  };

  const formatDateInput = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');

    // Apply formatting based on length
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (!match) return '';

    let formatted = match[1];
    if (match[2]) formatted += `/${match[2]}`;
    if (match[3]) formatted += `/${match[3]}`;

    return formatted;
  };

  const renderSurfaceInput = () => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Surface du terrain
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.surface_area?.toString() ?? ''}
            onChangeText={(text) =>
              updateDraftMission({ surface_area: parseFloat(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="Ex: 100"
            placeholderTextColor={colors.muted}
          />

          <TouchableOpacity
            style={styles.unitSelector}
            onPress={() => setShowUnitPicker(true)}
          >
            <Text style={[styles.unitText, { color: colors.text }]}>
              {draftMission?.surface_unit || 'Sélectionner unité'}
            </Text>
          </TouchableOpacity>

          {showUnitPicker && (
            <Modal
              transparent
              visible={showUnitPicker}
              onRequestClose={() => setShowUnitPicker(false)}
            >
              <View style={[styles.modalOverlay]}>
                <View style={[styles.modalContent]}>
                  {SURFACE_UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit.id}
                      style={[
                        styles.modalItem,
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => {
                        updateDraftMission({ surface_unit: unit.id });
                        setShowUnitPicker(false);
                      }}
                    >
                      <Text
                        style={[styles.modalItemText, { color: colors.text }]}
                      >
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>
          )}
        </View>
      </View>
    );
  };

  const renderBasicsStep = () => (
    <Animated.View entering={FadeInDown}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Expertise Recherchée
        </Text>
        <View style={styles.roleButtons}>
          {availableRoles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    draftMission?.needed_actor === role
                      ? colors.primary
                      : colors.border,
                },
                draftMission?.needed_actor === role && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => updateDraftMission({ needed_actor: role })}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: colors.muted },
                  draftMission?.needed_actor === role && { color: colors.card },
                ]}
              >
                {role === 'technician'
                  ? 'Technicien'
                  : role === 'worker'
                  ? 'Travailleur'
                  : 'Entrepreneur'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Spécialisation de l'acteur
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Briefcase
            size={20}
            color={colors.primary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.actor_specialization}
            onChangeText={(text) =>
              updateDraftMission({ actor_specialization: text })
            }
            placeholder="Ex: Récolte, Plantation, etc."
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Titre de la mission
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Briefcase
            size={20}
            color={colors.primary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.mission_title}
            onChangeText={(text) => updateDraftMission({ mission_title: text })}
            placeholder="Ex: Récolte de pommes bio"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <View
          style={[
            styles.inputWrapper,
            styles.textAreaWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <FileText size={20} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text }]}
            value={draftMission?.mission_description}
            onChangeText={(text) =>
              updateDraftMission({ mission_description: text })
            }
            placeholder="Décrivez la mission en détail..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Nombre de personnes recherchées
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Users size={20} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.needed_actor_amount?.toString()}
            onChangeText={(text) =>
              updateDraftMission({ needed_actor_amount: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="Nombre de personnes"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        {/* <Text style={[styles.label, { color: colors.text }]}>
          Surface du terrain
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.surface_area?.toString() ?? ''}
            onChangeText={(text) =>
              updateDraftMission({ surface_area: parseFloat(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="Ex: 100"
            placeholderTextColor={colors.muted}
          />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.surface_unit}
            onChangeText={(text) => updateDraftMission({ surface_unit: text })}
            placeholder="Ex: hectares"
            placeholderTextColor={colors.muted}
          />
        </View> */}
        {renderSurfaceInput()}
      </View>
    </Animated.View>
  );

  const renderLogisticsStep = () => (
    <Animated.View entering={FadeInDown}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Localisation</Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MapPin size={20} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={draftMission?.location}
            onChangeText={(text) =>
              updateDraftMission({
                location: text,
              })
            }
            placeholder="Adresse de la mission"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <View style={styles.dateContainer}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date de début
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Calendar
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={draftMission?.start_date}
              onChangeText={(text) => {
                const formatted = formatDateInput(text);
                updateDraftMission({ start_date: formatted });
              }}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date de fin
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Calendar
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={draftMission?.end_date}
              onChangeText={(text) => {
                const formatted = formatDateInput(text);
                updateDraftMission({ end_date: formatted });
              }}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderRequirementsStep = () => (
    <Animated.View entering={FadeInDown}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Niveau d'expérience requis
        </Text>
        <View style={styles.experienceLevels}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.experienceButton,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    experienceLevel === level.id
                      ? colors.primary
                      : colors.border,
                },
                experienceLevel === level.id && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => {
                setExperienceLevel(level.id as ExperienceLevel);
                updateDraftMission({
                  required_experience_level:
                    (level.id as ExperienceLevel) || 'starter',
                });
              }}
            >
              <Text
                style={[
                  styles.experienceButtonText,
                  { color: colors.muted },
                  experienceLevel === level.id && { color: colors.card },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Équipement
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: colors.card,
              borderColor: providesEquipment ? colors.primary : colors.border,
            },
          ]}
          onPress={() => {
            const newValue = !providesEquipment;
            setProvidesEquipment(newValue);
            updateDraftMission({ equipment: newValue });
          }}
        >
          <Tool
            size={20}
            color={providesEquipment ? colors.primary : colors.muted}
          />
          <Text
            style={[
              styles.toggleButtonText,
              { color: providesEquipment ? colors.primary : colors.muted },
            ]}
          >
            {providesEquipment ? 'Équipement fourni' : 'Équipement non fourni'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Avantages proposés
        </Text>
        <View style={styles.advantagesGrid}>
          {ADVANTAGES.map((advantage) => (
            <TouchableOpacity
              key={advantage.id}
              style={[
                styles.advantageButton,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedAdvantages.includes(
                    advantage.id as AdvantageType[number]
                  )
                    ? colors.primary
                    : colors.border,
                },
                selectedAdvantages.includes(
                  advantage.id as AdvantageType[number]
                ) && {
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => {
                const newAdvantages = selectedAdvantages.includes(
                  advantage.id as AdvantageType[number]
                )
                  ? selectedAdvantages.filter((id) => id !== advantage.id)
                  : [
                      ...selectedAdvantages,
                      advantage.id as AdvantageType[number],
                    ];
                setSelectedAdvantages(newAdvantages);
                updateDraftMission({ proposed_advantages: newAdvantages });
              }}
            >
              <advantage.icon
                size={24}
                color={
                  selectedAdvantages.includes(
                    advantage.id as AdvantageType[number]
                  )
                    ? colors.primary
                    : colors.muted
                }
              />
              <Text
                style={[
                  styles.advantageButtonText,
                  {
                    color: selectedAdvantages.includes(
                      advantage.id as AdvantageType[number]
                    )
                      ? colors.primary
                      : colors.muted,
                  },
                ]}
              >
                {advantage.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderPricingStep = () => {
    const basePrice = calculateBasePrice();
    const adjustments = calculateAdjustments();
    const finalPrice = calculateFinalPrice();
    const manualAdjustment = basePrice * (priceAdjustment / 100);

    return (
      <Animated.View entering={FadeInDown}>
        <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
          <View style={styles.priceHeader}>
            <Text style={[styles.priceTitle, { color: colors.text }]}>
              Prix calculé
            </Text>
            <TouchableOpacity
              style={[
                styles.infoButton,
                { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => {
                // Show pricing info modal
              }}
            >
              <Info size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.finalPrice, { color: colors.primary }]}>
            {finalPrice.toLocaleString()} FCFA
          </Text>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.muted }]}>
                Coût de base
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                {basePrice.toLocaleString()} FCFA
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.muted }]}>
                Coût opérationnel
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                {adjustments.toLocaleString()} FCFA
              </Text>
            </View>

            {priceAdjustment !== 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>
                  Ajustement manuel
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  {priceAdjustment}% ({manualAdjustment.toLocaleString()} FCFA)
                </Text>
              </View>
            )}

            <View style={[styles.priceRow, { marginTop: 16 }]}>
              <Text style={[styles.priceLabel, { color: colors.primary }]}>
                Prix total
              </Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                {finalPrice.toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          <View style={styles.adjustmentSection}>
            <Text style={[styles.adjustmentLabel, { color: colors.text }]}>
              Ajustement du prix ({priceAdjustment}%)
            </Text>
            <View style={[styles.slider, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.sliderFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${((priceAdjustment + 10) / 20) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: colors.muted }]}>
                -10%
              </Text>
              <Text style={[styles.sliderLabel, { color: colors.muted }]}>
                0%
              </Text>
              <Text style={[styles.sliderLabel, { color: colors.muted }]}>
                +10%
              </Text>
            </View>

            {priceAdjustment !== 0 && (
              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <FileText
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.text },
                  ]}
                  value={adjustmentReason}
                  onChangeText={setAdjustmentReason}
                  placeholder="Raison de l'ajustement..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderReviewStep = () => (
    <Animated.View
      entering={FadeInDown}
      style={[styles.reviewContainer, { backgroundColor: colors.card }]}
    >
      <Text style={[styles.reviewTitle, { color: colors.text }]}>
        Récapitulatif de la mission
      </Text>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
          Informations générales
        </Text>
        <Text style={[styles.reviewLabel, { color: colors.muted }]}>Type</Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.needed_actor === 'technician'
            ? 'Technicien'
            : draftMission?.needed_actor === 'worker'
            ? 'Travailleur'
            : 'Entrepreneur'}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>Titre</Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.mission_title}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Description
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.mission_description}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Spécialisation de l'acteur
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.actor_specialization}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
          Détails
        </Text>
        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Localisation
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.location}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Période
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          Du {draftMission?.start_date} au {draftMission?.end_date}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Personnes recherchées
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.needed_actor_amount}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Surface
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {draftMission?.surface_area} {draftMission?.surface_unit}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
          Exigences et équipement
        </Text>
        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Niveau d'expérience
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {
            EXPERIENCE_LEVELS.find((level) => level.id === experienceLevel)
              ?.label
          }
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Équipement
        </Text>
        <Text style={[styles.reviewValue, { color: colors.text }]}>
          {providesEquipment ? "Fourni par l'employeur" : 'Non fourni'}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
          Avantages
        </Text>
        {selectedAdvantages.map((advantageId) => {
          const advantage = ADVANTAGES.find((a) => a.id === advantageId);
          return (
            <Text
              key={advantageId}
              style={[styles.reviewValue, { color: colors.text }]}
            >
              • {advantage?.label}
            </Text>
          );
        })}
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
          Rémunération
        </Text>
        <Text style={[styles.reviewLabel, { color: colors.muted }]}>
          Prix final
        </Text>
        <Text style={[styles.reviewValue, { color: colors.primary }]}>
          {calculateFinalPrice().toLocaleString()} FCFA
        </Text>

        {priceAdjustment !== 0 && (
          <>
            <Text style={[styles.reviewLabel, { color: colors.muted }]}>
              Ajustement manuel
            </Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {priceAdjustment}% - {adjustmentReason}
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );

  const renderImageUploadStep = () => {
    const handleImageSelection = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          selectionLimit: 4,
          quality: 1,
        });

        if (!result.canceled) {
          const selectedImages = result.assets;

          if (selectedImages.length > 4) {
            alert("Vous pouvez choisir jusqu'à 4 images.");
            return;
          }

          const newImageUris = selectedImages.map((image) => image.uri);
          setUploadedImages(newImageUris); // Store URIs for preview and later upload
        }
      } catch (error) {
        console.error('Error selecting images:', error);
        alert('An error occurred while selecting images.');
      }
    };

    return (
      <Animated.View entering={FadeInDown}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Téléchargez des images
          </Text>
          <Text style={[styles.label, { color: colors.muted }]}>
            Ajoutez des images de la mission (taille maximale: 5MB par image).
          </Text>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            onPress={handleImageSelection}
          >
            <Text style={[styles.uploadButtonText, { color: colors.card }]}>
              Choisir des images
            </Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {uploadedImages.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.image} />
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basics':
        return renderBasicsStep();
      case 'logistics':
        return renderLogisticsStep();
      case 'requirements':
        return renderRequirementsStep();
      case 'pricing':
        return renderPricingStep();
      case 'review':
        return renderReviewStep();
      case 'images':
        return renderImageUploadStep();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basics':
        return !!(
          draftMission?.needed_actor &&
          draftMission?.mission_title &&
          draftMission?.mission_description &&
          draftMission?.needed_actor_amount &&
          draftMission?.actor_specialization &&
          draftMission?.surface_area &&
          draftMission?.surface_unit
        );
      case 'logistics':
        return !!(
          draftMission?.location &&
          draftMission?.start_date &&
          draftMission?.end_date
        );
      case 'requirements':
        return true; // No validation needed for this step
      case 'pricing':
        return true; // Pricing step always allows proceeding
      case 'review':
        return true; // Add review step validation if needed
      case 'images':
        return true; // Add image upload step validation if needed
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'review') {
      handleCreate();
    } else {
      // Existing step progression logic
      switch (currentStep) {
        case 'basics':
          setCurrentStep('logistics');
          break;
        case 'logistics':
          setCurrentStep('requirements');
          break;
        case 'requirements':
          setCurrentStep('pricing');
          break;
        case 'pricing':
          setCurrentStep('images');
          break;
        case 'images':
          setCurrentStep('review');
          break;
      }
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'logistics':
        setCurrentStep('basics');
        break;
      case 'requirements':
        setCurrentStep('logistics');
        break;
      case 'pricing':
        setCurrentStep('requirements');
        break;
      case 'images':
        setCurrentStep('pricing');
        break;
      case 'review':
        setCurrentStep('images');
        break;
    }
  };

  const uploadToStorage = async (
    fileUri: string,
    path: string,
    contentType: string
  ) => {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });
    const arrayBuffer = decode(base64);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;
    return data.path;
  };

  const handleCreate = async () => {
    if (!draftMission) return;

    const formatDateForDB = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month}-${day}`;
    };

    try {
      // Upload images to Supabase storage
      const uploadedPaths = [];
      for (const uri of uploadedImages) {
        const fileExt = uri.split('.').pop();
        const fileName = uri.split('/').pop();
        const path = `images/${Date.now()}-${fileName}`;
        const contentType = `image/${fileExt}`;
        const uploadedPath = await uploadToStorage(uri, path, contentType);
        uploadedPaths.push(uploadedPath);
      }

      // Calculate prices
      const basePrice = calculateBasePrice();
      const adjustments = calculateAdjustments();
      const manualAdjustment = basePrice * (priceAdjustment / 100);
      const finalPrice = calculateFinalPrice();

      const job = {
        ...draftMission,
        start_date: formatDateForDB(draftMission?.start_date || ''),
        end_date: formatDateForDB(draftMission?.end_date || ''),
        mission_images: uploadedPaths, // Store uploaded image paths
        original_price: {
          price: basePrice.toString(),
          status: 'current' as PriceStatus,
        },
        adjustment_price: {
          price: adjustments.toString() + manualAdjustment.toString(),
          status: 'current' as PriceStatus,
        },
        final_price: finalPrice.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Submitting job with images and prices:', {
        images: job.mission_images,
        original: job.original_price,
        adjustment: job.adjustment_price,
        final: job.final_price,
      });

      const createdJob = await createMission(job);
      if (createdJob) router.replace('/');
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('An error occurred while creating the job.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {error && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: colors.error + '20' },
            ]}
          >
            <AlertCircle size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.progress}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentStep === 'basics'
                      ? 1
                      : currentStep === 'logistics'
                      ? 2
                      : currentStep === 'requirements'
                      ? 3
                      : currentStep === 'pricing'
                      ? 4
                      : currentStep === 'images'
                      ? 5
                      : 6) /
                      6) *
                    100
                  }%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            Étape{' '}
            {currentStep === 'basics'
              ? '1'
              : currentStep === 'logistics'
              ? '2'
              : currentStep === 'requirements'
              ? '3'
              : currentStep === 'pricing'
              ? '4'
              : currentStep === 'images'
              ? '5'
              : '6'}{' '}
            sur 6
          </Text>
        </View>

        {renderCurrentStep()}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        {currentStep !== 'basics' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.backButton,
              { backgroundColor: colors.border },
            ]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Retour
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            { backgroundColor: colors.primary },
            (!canProceed() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={[styles.buttonText, { color: colors.card }]}>
            {currentStep === 'review'
              ? loading
                ? 'Création...'
                : 'Créer'
              : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  progress: {
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  experienceLevels: {
    flexDirection: 'row',
    gap: 12,
  },
  experienceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  experienceButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  toggleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  advantageButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  advantageButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  priceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
  },
  finalPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    marginBottom: 24,
  },
  priceBreakdown: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  priceValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  adjustmentSection: {
    marginTop: 24,
  },
  adjustmentLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
  },
  slider: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  sliderLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  reviewContainer: {
    borderRadius: 16,
    padding: 20,
  },
  reviewTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 24,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  reviewLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  reviewValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  uploadButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unitSelector: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  unitText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    marginHorizontal: 20,
    borderRadius: 12,
    maxHeight: '60%',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});

export default CreateJobScreen;
