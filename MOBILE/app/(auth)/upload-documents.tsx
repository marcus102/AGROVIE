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
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Toast, ToastType } from '@/components/Toast';

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
}

const ID_TYPES: DocumentTypeOption[] = [
  {
    id: 'id_card',
    title: "Carte d'identité",
    description: "Carte nationale d'identité en cours de validité",
  },
  {
    id: 'passport',
    title: 'Passeport',
    description: 'Passeport en cours de validité',
  },
  {
    id: 'driver_license',
    title: 'Permis de conduire',
    description: 'Permis de conduire en cours de validité',
  },
  {
    id: 'residence_permit',
    title: 'Titre de séjour',
    description: 'Titre de séjour en cours de validité',
  },
];

const LEGAL_TYPES: DocumentTypeOption[] = [
  {
    id: 'business',
    title: "Licence d'entreprise",
    description: 'Document KBIS ou équivalent',
  },
  {
    id: 'certification',
    title: 'Certification',
    description: 'Diplôme ou certification professionnelle',
  },
  {
    id: 'work_permit',
    title: 'Permis de travail',
    description: 'Autorisation de travail',
  },
  {
    id: 'insurance',
    title: 'Assurance',
    description: "Attestation d'assurance professionnelle",
  },
  {
    id: 'experience',
    title: "Attestation d'expérience",
    description: 'Lettre de recommandation ou contrat',
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
    },
    {
      id: 'legal',
      title: 'Document légal',
      description: "Document légal tel qu'une licence ou un permis",
      required: true,
      maxSize: 5,
      formats: ['jpg', 'png', 'pdf'],
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Text>

          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
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
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.border }]}
            onPress={onClose}
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
  };

  const handleDocumentTypeSelect = async (option: DocumentTypeOption) => {
    if (!selectedRequirement) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
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

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === newDoc.id ? { ...d, progress } : d
              )
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
        requiredDocs.some((r) => r.id === d.requirementId && d.status === 'completed')
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
          size: documents.reduce((total, doc) => total + doc.fileSize, 0),
          type: documents.map((doc) => doc.fileType).join(', '),
          uploaded_at: new Date().toISOString(),
        },
      };

      for (const doc of documents) {
        const fileExt = doc.fileType.split('/')[1];
        const timestamp = Date.now();
        const isIdDocument = doc.requirementId === 'identity';

        const path = `${user.id}/${
          isIdDocument ? 'id' : 'legal'
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
      if (__DEV__) console.error(err);
      showToast('error', 'Échec du téléchargement des documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={() => router.push('/(auth)/register')}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Téléchargement des documents
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Veuillez fournir les documents requis pour vérifier votre compte
          </Text>
        </Animated.View>

        <View style={styles.progress}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '75%' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            Étape 3 sur 4
          </Text>
        </View>

        <View style={styles.requirements}>
          {requirements.map((req, index) => {
            const doc = documents.find((d) => d.requirementId === req.id);

            return (
              <Animated.View
                key={req.id}
                entering={FadeInDown.delay(index * 100)}
                style={[
                  styles.requirementCard,
                  { backgroundColor: colors.card },
                ]}
              >
                <View style={styles.requirementHeader}>
                  <Text
                    style={[styles.requirementTitle, { color: colors.text }]}
                  >
                    {req.title}
                    {req.required && (
                      <Text style={{ color: colors.error }}> *</Text>
                    )}
                  </Text>
                  {doc?.status === 'completed' && (
                    <CheckCircle2 size={20} color={colors.success} />
                  )}
                </View>

                <Text
                  style={[
                    styles.requirementDescription,
                    { color: colors.muted },
                  ]}
                >
                  {req.description}
                </Text>

                {doc?.documentType && (
                  <View
                    style={[
                      styles.selectedType,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectedTypeText,
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

                <Text style={[styles.formatInfo, { color: colors.muted }]}>
                  Formats acceptés: {req.formats.join(', ')} • Max {req.maxSize}
                  MB
                </Text>

                {doc ? (
                  <View style={styles.uploadedDocument}>
                    <Image
                      source={{ uri: doc.file }}
                      style={styles.documentPreview}
                    />

                    {doc.status === 'uploading' ? (
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
                              width:
                                doc.progress !== undefined
                                  ? `${doc.progress}%`
                                  : '0%',
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.uploadProgressText,
                            { color: colors.text },
                          ]}
                        >
                          {doc.progress}%
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          { backgroundColor: colors.error + '20' },
                        ]}
                        onPress={() => removeDocument(doc.id)}
                      >
                        <Trash2 size={20} color={colors.error} />
                        <Text
                          style={[
                            styles.removeButtonText,
                            { color: colors.error },
                          ]}
                        >
                          Supprimer
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                    onPress={() => pickDocument(req)}
                  >
                    <Camera size={24} color={colors.primary} />
                    <Text
                      style={[
                        styles.uploadButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      Sélectionner un document
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: colors.card }]}>
            {loading ? 'Téléchargement en cours...' : 'Soumettre les documents'}
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
        title={`Sélectionner le type de ${selectedRequirement?.title}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: Platform.OS === 'web' ? 24 : 65,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  progress: {
    marginBottom: 32,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  requirements: {
    gap: 16,
  },
  requirementCard: {
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
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  requirementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  formatInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  uploadedDocument: {
    gap: 12,
  },
  documentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  uploadProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  uploadProgressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  removeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  modalScroll: {
    maxHeight: 400,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeInfo: {
    flex: 1,
    marginRight: 16,
  },
  typeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  typeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  selectedType: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  selectedTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});