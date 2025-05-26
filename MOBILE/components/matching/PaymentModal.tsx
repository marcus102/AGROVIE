import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { BaseModal } from '../modals/BaseModal';
import { Phone, Key, AlertCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMatchingStore } from '@/stores/matching';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaymentModal({ visible, onClose }: PaymentModalProps) {
  const { colors } = useThemeStore();
  const { selectedMatch, initiatePayment, verifyPayment, paymentStatus, loading, error } = useMatchingStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleInitiatePayment = async () => {
    if (!phoneNumber.match(/^\+?[0-9]{8,}$/)) {
      return;
    }

    await initiatePayment(phoneNumber);
    setStep('otp');
  };

  const handleVerifyPayment = async () => {
    if (!otpCode.match(/^[0-9]{6}$/)) {
      return;
    }

    await verifyPayment(otpCode);
    if (!error) {
      onClose();
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Paiement Orange Money
        </Text>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <AlertCircle size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.muted }]}>
            Montant à payer
          </Text>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {selectedMatch?.pricing.finalPrice.toLocaleString()} FCFA
          </Text>
          <Text style={[styles.amountBreakdown, { color: colors.muted }]}>
            Commission (30%): {(selectedMatch?.pricing.finalPrice * 0.3).toLocaleString()} FCFA
          </Text>
          <Text style={[styles.amountBreakdown, { color: colors.muted }]}>
            Montant travailleur (70%): {(selectedMatch?.pricing.finalPrice * 0.7).toLocaleString()} FCFA
          </Text>
        </View>

        {step === 'phone' ? (
          <Animated.View entering={FadeInDown}>
            <Text style={[styles.instructions, { color: colors.text }]}>
              Entrez votre numéro Orange Money pour initier le paiement
            </Text>

            <View style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}>
              <Phone size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ex: +221 77 123 45 67"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                (!phoneNumber.match(/^\+?[0-9]{8,}$/) || loading) && styles.buttonDisabled
              ]}
              onPress={handleInitiatePayment}
              disabled={!phoneNumber.match(/^\+?[0-9]{8,}$/) || loading}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown}>
            <Text style={[styles.instructions, { color: colors.text }]}>
              Composez *144*4543*{selectedMatch?.pricing.finalPrice}# sur votre téléphone pour générer le code OTP
            </Text>

            <View style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}>
              <Key size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Code OTP à 6 chiffres"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                (!otpCode.match(/^[0-9]{6}$/) || loading) && styles.buttonDisabled
              ]}
              onPress={handleVerifyPayment}
              disabled={!otpCode.match(/^[0-9]{6}$/) || loading}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
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
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  amountBreakdown: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  instructions: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  button: {
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
});