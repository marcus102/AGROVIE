import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BaseModal } from '../modals/BaseModal';
import { FileText, CheckCircle2, XCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMatchingStore } from '@/stores/matching';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ContractModalProps {
  visible: boolean;
  onClose: () => void;
  role: 'worker' | 'employer';
}

export function ContractModal({ visible, onClose, role }: ContractModalProps) {
  const { colors } = useThemeStore();
  const { selectedMatch, contractStatus, acceptContract, rejectContract, loading } = useMatchingStore();

  const handleAccept = async () => {
    await acceptContract(role);
    if (contractStatus?.status === 'accepted') {
      onClose();
    }
  };

  const handleReject = async () => {
    await rejectContract(role, 'Conditions non satisfaisantes');
    onClose();
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Contrat de Mission
        </Text>

        <ScrollView style={styles.content}>
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Détails de la mission
            </Text>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Montant
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {selectedMatch?.pricing.finalPrice.toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Commission (30%)
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {(selectedMatch?.pricing.finalPrice * 0.3).toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Montant net (70%)
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {(selectedMatch?.pricing.finalPrice * 0.7).toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Conditions générales
            </Text>
            {contractStatus?.terms.map((term, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100)}
                style={[styles.termItem, { backgroundColor: colors.border }]}
              >
                <FileText size={20} color={colors.primary} />
                <Text style={[styles.termText, { color: colors.text }]}>
                  {term}
                </Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Signatures
            </Text>
            <View style={styles.signatures}>
              <View style={styles.signatureItem}>
                <Text style={[styles.signatureRole, { color: colors.muted }]}>
                  Employeur
                </Text>
                {contractStatus?.acceptedByEmployer ? (
                  <View style={[styles.signatureStatus, { backgroundColor: colors.success + '20' }]}>
                    <CheckCircle2 size={16} color={colors.success} />
                    <Text style={[styles.signatureStatusText, { color: colors.success }]}>
                      Signé
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.signatureStatus, { backgroundColor: colors.warning + '20' }]}>
                    <XCircle size={16} color={colors.warning} />
                    <Text style={[styles.signatureStatusText, { color: colors.warning }]}>
                      En attente
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.signatureItem}>
                <Text style={[styles.signatureRole, { color: colors.muted }]}>
                  Travailleur
                </Text>
                {contractStatus?.acceptedByWorker ? (
                  <View style={[styles.signatureStatus, { backgroundColor: colors.success + '20' }]}>
                    <CheckCircle2 size={16} color={colors.success} />
                    <Text style={[styles.signatureStatusText, { color: colors.success }]}>
                      Signé
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.signatureStatus, { backgroundColor: colors.warning + '20' }]}>
                    <XCircle size={16} color={colors.warning} />
                    <Text style={[styles.signatureStatusText, { color: colors.warning }]}>
                      En attente
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={handleReject}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.error }]}>Refuser</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.acceptButton,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled
            ]}
            onPress={handleAccept}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>
              {loading ? 'Signature...' : 'Signer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '90%',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    padding: 24,
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  detailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  termText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  signatures: {
    gap: 16,
  },
  signatureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  signatureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  signatureStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: 'transparent',
  },
  acceptButton: {
    backgroundColor: '#166534',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});