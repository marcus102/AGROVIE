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
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMissionStore } from '@/stores/mission';
import { Mission } from '@/types/mission';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import {
  createPaymentRecord,
  verifyPaymentOTP,
  processPayment,
  updatePaymentRecord,
} from '@/stores/payment';
import { PaymentMethod, PaymentType } from '@/types/payment';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Toast, ToastType } from '@/components/Toast';

const PaymentScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    'init' | 'otp' | 'success' | 'failed'
  >('init');
  const [generatedOTP, setGeneratedOTP] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const { fetchMissionByID, updateMission, loading, error } = useMissionStore();
  const [mission, setMission] = useState<Mission | null>(null);
  const { colors } = useThemeStore();
  // const { payments, currentPayment } = usePaymentStore();
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

  // const showToast = (message: string, type: ToastType = 'info') => {
  //   setToastMessage(message);
  //   setToastType(type);
  //   setToastVisible(true);
  // };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Validate phone number format (Burkina Faso format)
  const validatePhoneNumber = (phone: string) => {
    const burkinaPhoneRegex = /^(6|7)\d{7}$/;
    return burkinaPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length >= 2) {
      return cleanPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return cleanPhone;
  };

  // Generate OTP for simulation (in production, this would come from payment gateway)
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const initiatePayment = async () => {
    if (!mission) {
      Alert.alert('Erreur', 'Mission non trouvée');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer un numéro de téléphone valide (format: 6X XX XX XX)'
      );
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Initialisation du paiement...');

    try {
      // Generate OTP for simulation
      const otp = generateOTP();
      setGeneratedOTP(otp);

      // Create payment record
      const paymentData = {
        user_id: mission.user_id, // This should be the current user's ID
        user_phone: parseInt(phoneNumber.replace(/\s/g, '')),
        payment_method: 'mobile_payment' as PaymentMethod,
        payment_reference: `OM_${Date.now()}_${phoneNumber.slice(-4)}`,
        payment_type: 'mission_payment' as PaymentType,
        amount: parseFloat(mission.final_price),
        otp_code: otp,
        description: `Paiement pour la mission: ${mission.mission_title}`,
        mission_id: mission.id,
        metadata: {
          mission_title: mission.mission_title,
          payment_gateway: 'orange_money',
          phone_number: phoneNumber,
        },
      };

      const paymentResult = await createPaymentRecord(paymentData);

      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }

      if (paymentResult.data) {
        setCurrentPaymentId(paymentResult.data.id);

        // Simulate Orange Money API call
        try {
          // In production, you would make actual API calls here
          await simulateOrangeMoneyAPI(phoneNumber, mission.final_price);

          setPaymentStatus(`Code OTP envoyé au ${phoneNumber}`);
          setPaymentStep('otp');

          // Show OTP for simulation (remove in production)
          Alert.alert('Code OTP (Simulation)', `Votre code OTP est: ${otp}`, [
            { text: 'OK' },
          ]);
        } catch (apiError) {
          throw new Error(
            "Échec de l'initialisation du paiement avec Orange Money"
          );
        }
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'initialisation du paiement"
      );
      setPaymentStep('failed');

      // Update payment record as failed if it was created
      if (currentPaymentId) {
        await updatePaymentRecord(currentPaymentId, {
          status: 'failed',
          metadata: {
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyOTP = async () => {
    if (!currentPaymentId || !generatedOTP) {
      Alert.alert('Erreur', 'Session de paiement invalide');
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code OTP valide (6 chiffres)');
      return;
    }

    if (!mission) {
      Alert.alert('Erreur', 'Mission non trouvée');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Vérification du code OTP...');

    try {
      // Verify OTP
      const verificationResult = await verifyPaymentOTP(
        currentPaymentId,
        parseInt(otpCode)
      );

      if (verificationResult.error) {
        throw new Error(verificationResult.error);
      }

      // Process payment
      const processResult = await processPayment(currentPaymentId);

      if (processResult.error) {
        throw new Error(processResult.error);
      }

      // Final update to completed status
      await updatePaymentRecord(currentPaymentId, {
        status: 'completed',
        metadata: {
          completion_time: new Date().toISOString(),
          verified: true,
        },
      });

      // Update mission status to "online" after successful payment
      await updateMission(mission.id, {
        status: 'online',
        payment_id: currentPaymentId,
      });

      // Update local mission state
      setMission((prev) => (prev ? { ...prev, status: 'online' } : null));

      setPaymentStatus('Paiement réussi !');
      setPaymentStep('success');

      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('OTP verification error:', error);
      setPaymentStatus(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la vérification OTP'
      );
      setPaymentStep('failed');

      // Update payment record as failed
      if (currentPaymentId) {
        await updatePaymentRecord(currentPaymentId, {
          status: 'failed',
          metadata: {
            error_message:
              error instanceof Error
                ? error.message
                : 'OTP verification failed',
          },
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Orange Money API (replace with actual API in production)
  const simulateOrangeMoneyAPI = async (phone: string, amount: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API success/failure
        if (Math.random() > 0.1) {
          // 90% success rate for simulation
          resolve({ success: true, message: 'OTP sent' });
        } else {
          reject(new Error('Service Orange Money temporairement indisponible'));
        }
      }, 2000);
    });
  };

  const handleRetry = () => {
    setPaymentStep('init');
    setPaymentStatus('');
    setOtpCode('');
    setCurrentPaymentId(null);
    setGeneratedOTP(null);
  };

  const handleCancel = () => {
    if (currentPaymentId) {
      updatePaymentRecord(currentPaymentId, {
        status: 'cancelled',
        metadata: {
          cancelled_by_user: true,
          cancelled_at: new Date().toISOString(),
        },
      });
    }
    router.back();
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
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement de la mission...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={handleCancel}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Paiement Orange Money
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mission Info */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Détails de la mission
          </Text>
          <Text style={[styles.missionTitle, { color: colors.text }]}>
            {mission.mission_title}
          </Text>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {parseInt(mission.final_price).toLocaleString()} FCFA
          </Text>
          <Text style={[styles.missionLocation, { color: colors.muted }]}>
            📍 {mission.location}
          </Text>
        </Animated.View>

        {/* Payment Form */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {paymentStep === 'init'
              ? 'Informations de paiement'
              : paymentStep === 'otp'
              ? 'Vérification OTP'
              : paymentStep === 'success'
              ? 'Paiement réussi'
              : 'Échec du paiement'}
          </Text>

          {paymentStep === 'init' && (
            <>
              <View
                style={[
                  styles.info,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Composez *144*475638*{mission?.final_price}# puis suivez les
                  instructions
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Numéro Orange Money *
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
                  value={formatPhoneNumber(phoneNumber)}
                  onChangeText={(text) =>
                    setPhoneNumber(text.replace(/\s/g, ''))
                  }
                  keyboardType="phone-pad"
                  maxLength={11} // Including spaces
                />
              </View>
            </>
          )}

          {paymentStep === 'otp' && (
            <>
              <View
                style={[
                  styles.info,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Un code OTP a été envoyé au {phoneNumber}. Veuillez l'entrer
                  ci-dessous.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Code OTP (6 chiffres) *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.otpInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus
                />
              </View>
            </>
          )}

          {(paymentStep === 'success' || paymentStep === 'failed') && (
            <Animated.View entering={FadeInUp} style={styles.statusContainer}>
              {paymentStep === 'success' ? (
                <CheckCircle size={48} color={colors.success} />
              ) : (
                <XCircle size={48} color={colors.error} />
              )}
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      paymentStep === 'success' ? colors.success : colors.error,
                  },
                ]}
              >
                {paymentStatus}
              </Text>
            </Animated.View>
          )}

          {paymentStatus &&
            paymentStep !== 'success' &&
            paymentStep !== 'failed' && (
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {paymentStatus}
              </Text>
            )}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        {paymentStep === 'init' && (
          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor:
                  isProcessing || !validatePhoneNumber(phoneNumber)
                    ? colors.muted
                    : colors.primary,
              },
            ]}
            onPress={initiatePayment}
            disabled={isProcessing || !validatePhoneNumber(phoneNumber)}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <CreditCard size={20} color={colors.card} />
                <Text style={[styles.payButtonText, { color: colors.card }]}>
                  Initier le paiement
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {paymentStep === 'otp' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleRetry}
              disabled={isProcessing}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Réessayer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.payButton,
                styles.flexButton,
                {
                  backgroundColor:
                    isProcessing || !otpCode || otpCode.length !== 6
                      ? colors.muted
                      : colors.primary,
                },
              ]}
              onPress={verifyOTP}
              disabled={isProcessing || !otpCode || otpCode.length !== 6}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <CheckCircle size={20} color={colors.card} />
                  <Text style={[styles.payButtonText, { color: colors.card }]}>
                    Vérifier OTP
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {paymentStep === 'failed' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.payButton,
                styles.flexButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleRetry}
            >
              <Text style={[styles.payButtonText, { color: colors.card }]}>
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {paymentStep === 'success' && (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.success }]}
            onPress={() => router.back()}
          >
            <CheckCircle size={20} color={colors.card} />
            <Text style={[styles.payButtonText, { color: colors.card }]}>
              Terminer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />
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
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
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
    paddingBottom: 120,
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
    fontSize: 28,
    marginBottom: 4,
  },
  missionLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 4,
    fontFamily: 'Inter-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
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
  info: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  flexButton: {
    flex: 2,
  },
});

export default PaymentScreen;
