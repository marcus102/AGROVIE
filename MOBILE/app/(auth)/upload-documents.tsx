import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  ChevronRight,
  FileText,
  Upload,
  Info,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Toast, ToastType } from '@/components/Toast';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type IdType = 'id_card' | 'passport' | 'driver_license' | 'residence_permit';
type LegalDocType =
  | 'business'
  | 'certification'
  | 'work_permit'
  | 'insurance'
  | 'experience';

interface Document {
  id: string;
  requirementId: string;
  type: string;
  documentType: IdType | LegalDocType;
  file: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface DocumentTypeOption {
  id: IdType | LegalDocType;
  title: string;
  description: string;
  icon?: string;
}

const ID_TYPES: DocumentTypeOption[] = [
  {
    id: 'id_card',
    title: "Carte d'identité",
    description: "Carte nationale d'identité en cours de validité",
    icon: '🆔',
  },
  {
    id: 'passport',
    title: 'Passeport',
    description: 'Passeport en cours de validité',
    icon: '📘',
  },
  {
    id: 'driver_license',
    title: 'Permis de conduire',
    description: 'Permis de conduire en cours de validité',
    icon: '🚗',
  },
  {
    id: 'residence_permit',
    title: 'Titre de séjour',
    description: 'Titre de séjour en cours de validité',
    icon: '📄',
  },
];

const LEGAL_TYPES: DocumentTypeOption[] = [
  {
    id: 'business',
    title: "Licence d'entreprise",
    description: 'Document KBIS ou équivalent',
    icon: '🏢',
  },
  {
    id: 'certification',
    title: 'Certification',
    description: 'Diplôme ou certification professionnelle',
    icon: '🎓',
  },
  {
    id: 'work_permit',
    title: 'Permis de travail',
    description: 'Autorisation de travail',
    icon: '💼',
  },
  {
    id: 'insurance',
    title: 'Assurance',
    description: "Attestation d'assurance professionnelle",
    icon: '🛡️',
  },
  {
    id: 'experience',
    title: "Attestation d'expérience",
    description: 'Lettre de recommandation ou contrat',
    icon: '📋',
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'application/pdf'];

const getRequirements = (role: string) => {
  return [
    {
      id: 'identity',
      title: "Pièce d'identité",
      description: "Carte d'identité ou passeport en cours de validité",
      required: true,
      maxSize: 5,
      formats: ['jpg', 'png', 'pdf'],
      icon: '🆔',
    },
    {
      id: 'legal',
      title: 'Document légal',
      description: "Document légal tel qu'une licence ou un permis",
      required: true,
      maxSize: 5,
      formats: ['jpg', 'png', 'pdf'],
      icon: '⚖️',
    },
  ];
};

function DocumentTypeModal({
  visible,
  onClose,
  onSelect,
  options,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: DocumentTypeOption) => void;
  options: DocumentTypeOption[];
  title: string;
}) {
  const { colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.background },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseText, { color: colors.muted }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {options.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(index * 50)}
              >
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.typeIconContainer}>
                    <Text style={styles.typeIcon}>{option.icon}</Text>
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={[styles.typeTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[styles.typeDescription, { color: colors.muted }]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.muted} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function UploadDocumentsScreen() {
  const { colors } = useThemeStore();
  const { profile, user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<
    (typeof requirements)[0] | null
  >(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  const hideToast = () => setToastVisible(false);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const requirements = getRequirements(profile?.role || 'worker');

  const validateFile = (
    fileUri: string,
    fileType: string,
    fileSize: number
  ) => {
    if (!SUPPORTED_FORMATS.includes(fileType)) {
      throw new Error(
        'Format de fichier non supporté. Veuillez utiliser JPG, PNG ou PDF.'
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      throw new Error('La taille du fichier dépasse la limite de 5MB.');
    }

    return true;
  };

  const uploadToStorage = async (
    fileUri: string,
    path: string,
    contentType: string
  ) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      const arrayBuffer = decode(base64);

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, arrayBuffer, {
          contentType,
          upsert: false,
        });

      if (error) throw error;
      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleDocumentTypeSelect = async (option: DocumentTypeOption) => {
    if (!selectedRequirement) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsEditing: true,
        aspect: [16, 9], // Set consistent aspect ratio
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileType = asset.mimeType || 'image/jpeg';
        const fileSize = asset.fileSize || 0;

        validateFile(asset.uri, fileType, fileSize);

        const newDoc: Document = {
          id: `${selectedRequirement.id}_${Date.now()}`,
          requirementId: selectedRequirement.id,
          type: selectedRequirement.title,
          documentType: option.id,
          file: asset.uri,
          fileType,
          fileSize,
          status: 'uploading',
          progress: 0,
        };

        setDocuments((prev) => [
          ...prev.filter((d) => d.requirementId !== selectedRequirement.id),
          newDoc,
        ]);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            setDocuments((prev) =>
              prev.map((d) => (d.id === newDoc.id ? { ...d, progress } : d))
            );
          } else {
            clearInterval(interval);
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === newDoc.id
                  ? { ...d, status: 'completed', progress: 100 }
                  : d
              )
            );
          }
        }, 500);
      }
    } catch (err) {
      console.error('Document selection error:', err);
      showToast('error', 'Échec de la sélection du document');
    }
  };

  const pickDocument = (requirement: (typeof requirements)[0]) => {
    setSelectedRequirement(requirement);
    setTypeModalVisible(true);
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!user?.id) throw new Error('Utilisateur non trouvé');

      const requiredDocs = requirements.filter((r) => r.required);
      const uploadedRequiredDocs = documents.filter((d) =>
        requiredDocs.some(
          (r) => r.id === d.requirementId && d.status === 'completed'
        )
      );

      if (uploadedRequiredDocs.length < requiredDocs.length) {
        throw new Error('Veuillez télécharger tous les documents requis');
      }

      const documentData: Record<string, any> = {
        user_id: user.id,
        identification_type: null,
        id_file_path: null,
        legal_document_type: null,
        legal_file_path: null,
        status: 'pending',
        metadata: {
          user_email: user.email,
          size: documents.reduce((total, doc) => total + doc.fileSize, 0),
          type: documents.map((doc) => doc.fileType).join(', '),
          uploaded_at: new Date().toISOString(),
        },
      };

      for (const doc of documents) {
        const fileExt = doc.fileType.split('/')[1];
        const timestamp = Date.now();
        const isIdDocument = doc.requirementId === 'identity';

        const path = `${user.id}/${isIdDocument ? 'id' : 'legal'
          }/${timestamp}.${fileExt}`;

        const storagePath = await uploadToStorage(doc.file, path, doc.fileType);

        if (isIdDocument) {
          documentData.identification_type = doc.documentType;
          documentData.id_file_path = storagePath;
        } else {
          documentData.legal_document_type = doc.documentType;
          documentData.legal_file_path = storagePath;
        }
      }

      const { data, error: docsError } = await supabase
        .from('user_documents')
        .insert([documentData])
        .select();

      if (docsError) throw docsError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ docs_status: 'pending' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      showToast('success', 'Documents téléchargés avec succès');
      router.push('/confirmation');
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', 'Échec du téléchargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    const requiredDocs = requirements.filter((r) => r.required);
    const completedDocs = documents.filter((d) => d.status === 'completed');
    return completedDocs.length >= requiredDocs.length && !loading;
  };

  const completedRequirements = documents.filter(
    (d) => d.status === 'completed'
  ).length;
  const totalRequirements = requirements.filter((r) => r.required).length;
  const progressPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />

      {/* Fixed Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Documents
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Header */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.mainHeader}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Vérification de votre compte
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Veuillez fournir les documents requis pour finaliser votre
            inscription
          </Text>
        </Animated.View>

        {/* Enhanced Progress Section */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={[styles.progressSection, { backgroundColor: colors.card }]}
        >
          <View style={styles.progressHeader}>
            <View style={styles.progressTextContainer}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>
                Progression
              </Text>
              <Text style={[styles.progressCount, { color: colors.primary }]}>
                {completedRequirements} / {totalRequirements} documents
              </Text>
            </View>
            <Text style={[styles.stepText, { color: colors.muted }]}>
              Étape 3 sur 4
            </Text>
          </View>

          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.primary + '10',
              borderColor: colors.primary + '20',
            },
          ]}
        >
          <Info size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              Documents sécurisés
            </Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Vos documents sont chiffrés et stockés en toute sécurité selon les
              normes RGPD
            </Text>
          </View>
        </Animated.View>

        {/* Requirements */}
        <View style={styles.requirements}>
          {requirements.map((req, index) => {
            const doc = documents.find((d) => d.requirementId === req.id);

            return (
              <View
                key={req.id}
                style={[
                  styles.requirementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      doc?.status === 'completed'
                        ? colors.success + '30'
                        : colors.border,
                    borderWidth: doc?.status === 'completed' ? 2 : 1,
                  },
                ]}
              >
                {/* Requirement Header */}
                <View style={styles.requirementHeader}>
                  <View style={styles.requirementTitleRow}>
                    <View
                      style={[
                        styles.requirementIconContainer,
                        { backgroundColor: colors.primary + '15' },
                      ]}
                    >
                      <Text style={styles.requirementIcon}>{req.icon}</Text>
                    </View>
                    <View style={styles.requirementTitleContainer}>
                      <Text
                        style={[
                          styles.requirementTitle,
                          { color: colors.text },
                        ]}
                      >
                        {req.title}
                        {req.required && (
                          <Text style={{ color: colors.error }}> *</Text>
                        )}
                      </Text>
                      <Text
                        style={[
                          styles.requirementDescription,
                          { color: colors.muted },
                        ]}
                      >
                        {req.description}
                      </Text>
                    </View>
                  </View>

                  {doc?.status === 'completed' && (
                    <View
                      style={[
                        styles.completedBadge,
                        { backgroundColor: colors.success + '15' },
                      ]}
                    >
                      <CheckCircle2 size={16} color={colors.success} />
                    </View>
                  )}
                </View>

                {/* Document Type Tag */}
                {doc?.documentType && (
                  <View
                    style={[
                      styles.documentTypeTag,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.documentTypeText,
                        { color: colors.primary },
                      ]}
                    >
                      {
                        (req.id === 'identity' ? ID_TYPES : LEGAL_TYPES).find(
                          (t) => t.id === doc.documentType
                        )?.title
                      }
                    </Text>
                  </View>
                )}

                {/* Format Info */}
                <View
                  style={[
                    styles.formatInfoContainer,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <FileText size={14} color={colors.muted} />
                  <Text style={[styles.formatInfo, { color: colors.muted }]}>
                    {req.formats.join(', ').toUpperCase()} • Max {req.maxSize}MB
                  </Text>
                </View>

                {/* Document Content */}
                {doc ? (
                  <View style={styles.documentContainer}>
                    {/* Fixed Document Preview */}
                    <View
                      style={[
                        styles.documentPreviewContainer,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Image
                        source={{ uri: doc.file }}
                        style={styles.documentPreview}
                        resizeMode="cover"
                      />
                      <View style={styles.documentOverlay}>
                        <View style={styles.documentStatusBadge}>
                          <Text
                            style={[
                              styles.documentStatusText,
                              {
                                backgroundColor:
                                  doc.status === 'completed'
                                    ? colors.success
                                    : colors.primary,
                              },
                            ]}
                          >
                            {doc.status === 'completed'
                              ? 'Validé'
                              : 'En cours...'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Upload Progress */}
                    {doc.status === 'uploading' &&
                      doc.progress !== undefined ? (
                      <View style={styles.uploadProgressContainer}>
                        <View
                          style={[
                            styles.uploadProgress,
                            { backgroundColor: colors.border },
                          ]}
                        >
                          <Animated.View
                            style={[
                              styles.uploadProgressFill,
                              {
                                backgroundColor: colors.primary,
                                width: `${doc.progress}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.uploadProgressText,
                            { color: colors.text },
                          ]}
                        >
                          Téléchargement en cours... {doc.progress}%
                        </Text>
                      </View>
                    ) : doc.status === 'completed' ? (
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          {
                            backgroundColor: colors.error + '10',
                            borderColor: colors.error + '20',
                          },
                        ]}
                        onPress={() => removeDocument(doc.id)}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color={colors.error} />
                        <Text
                          style={[
                            styles.removeButtonText,
                            { color: colors.error },
                          ]}
                        >
                          Remplacer le document
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      {
                        backgroundColor: colors.primary + '10',
                        borderColor: colors.primary + '20',
                        borderWidth: 2,
                        borderStyle: 'dashed',
                      },
                    ]}
                    onPress={() => pickDocument(req)}
                    activeOpacity={0.7}
                  >
                    <Upload size={24} color={colors.primary} />
                    <View style={styles.uploadButtonContent}>
                      <Text
                        style={[
                          styles.uploadButtonTitle,
                          { color: colors.primary },
                        ]}
                      >
                        Télécharger un document
                      </Text>
                      <Text
                        style={[
                          styles.uploadButtonSubtitle,
                          { color: colors.muted },
                        ]}
                      >
                        Appuyez pour sélectionner depuis votre appareil
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            !canSubmit() && { backgroundColor: colors.border, opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: canSubmit() ? colors.card : colors.muted },
            ]}
          >
            {loading ? 'Envoi en cours...' : 'Finaliser la vérification'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DocumentTypeModal
        visible={typeModalVisible}
        onClose={() => setTypeModalVisible(false)}
        onSelect={handleDocumentTypeSelect}
        options={
          selectedRequirement?.id === 'identity' ? ID_TYPES : LEGAL_TYPES
        }
        title={`Sélectionner le type de ${selectedRequirement?.title || 'document'
          }`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Fixed header container
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    // flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  headerSpacer: {
    width: 40,
  },
  // Content container
  content: {
    // flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  // Main header section
  mainHeader: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  // Progress section
  progressSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTextContainer: {
    // flex: 1,
  },
  progressLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  progressCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  stepText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Info card
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    // flex: 1,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  // Requirements section
  requirements: {
    marginBottom: 32,
  },
  requirementCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  requirementHeader: {
    marginBottom: 16,
  },
  requirementTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  requirementIcon: {
    fontSize: 20,
  },
  requirementTitleContainer: {
    // flex: 1,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  requirementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  requirementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  completedBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Document type and format info
  documentTypeTag: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  documentTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  formatInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  formatInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 6,
  },
  // Upload button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    minHeight: 80,
  },
  uploadButtonContent: {
    alignItems: 'center',
    marginLeft: 16,
  },
  uploadButtonTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  uploadButtonSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  // Document container - Fixed layout
  documentContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  documentPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: '#f8f9fa',
    width: '100%',
    height: screenHeight * 0.4,
    alignSelf: 'center',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  documentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  documentStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  documentStatusText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Upload progress
  uploadProgressContainer: {
    marginBottom: 12,
  },
  uploadProgress: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  uploadProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  uploadProgressText: {
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  // Remove button
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  removeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  // Submit button
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
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
  submitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    // flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    // flex: 1,
    paddingRight: 16,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalCloseText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#f8f9fa',
    flexShrink: 0,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeInfo: {
    // flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  typeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  typeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  cancelButton: {
    margin: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});