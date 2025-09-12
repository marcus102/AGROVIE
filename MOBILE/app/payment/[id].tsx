import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMissionStore } from '@/stores/mission';
import { Mission } from '@/types/mission';
import { CreditCard, ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PaymentScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { fetchMissionByID, loading, error } = useMissionStore();
  const [mission, setMission] = useState<Mission | null>(null);
  const { colors } = useThemeStore();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchMission = async () => {
      if (id) {
        const fetchedMission = await fetchMissionByID(id as string);
        if (!error) {
          setMission(fetchedMission);
        }
      }
    };
    fetchMission();
  }, [id]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // First initiate payment
      const initResponse = await fetch(
        'https://api.orange-money.com/initiate-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, amount: mission?.final_price }),
        }
      );

      if (!initResponse.ok) throw new Error('Payment initiation failed');

      // Then verify OTP
      const verifyResponse = await fetch(
        'https://api.orange-money.com/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode }),
        }
      );

      if (verifyResponse.ok) {
        setPaymentStatus('Payment successful!');
        router.back();
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        setPaymentStatus(error.message);
      } else {
        setPaymentStatus('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !mission) {
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Paiement
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mission Info */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Mission
          </Text>
          <Text style={[styles.missionTitle, { color: colors.text }]}>
            {mission.mission_title}
          </Text>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {parseInt(mission.final_price).toLocaleString()} FCFA
          </Text>
        </Animated.View>

        {/* Payment Form */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Informations de paiement
          </Text>
          <View style={[styles.info, { backgroundColor: colors.background }]}>
            <Text
              children={`Please dial *144*475638*${mission?.final_price}# and enter the OTP code sent to you.`} style={[styles.infoText, { color: colors.text }]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Numéro Orange Money
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="6X XX XX XX"
              placeholderTextColor={colors.muted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Code OTP
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Code reçu par SMS"
              placeholderTextColor={colors.muted}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="numeric"
            />
          </View>

          {paymentStatus ? (
            <Text
              style={[
                styles.statusText,
                {
                  color: paymentStatus.includes('success')
                    ? colors.success
                    : colors.error,
                },
              ]}
            >
              {paymentStatus}
            </Text>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor: isProcessing ? colors.muted : colors.primary,
              opacity: isProcessing ? 0.7 : 1,
            },
          ]}
          onPress={handlePayment}
          disabled={isProcessing || !phoneNumber || !otpCode}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <CreditCard size={20} color={colors.card} />
              <Text style={[styles.payButtonText, { color: colors.card }]}>
                Confirmer le paiement
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  missionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  amount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    borderWidth: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  payButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  ussdInstruction: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
  },
  info: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  }
});

export default PaymentScreen;
