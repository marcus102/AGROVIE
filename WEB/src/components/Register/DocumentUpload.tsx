import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react';
import { IdType, LegalDocType } from '../../store/adminStore';
import { v4 as uuidv4 } from 'uuid';

interface Document {
  id: string;
  type: string;
  documentType: IdType | LegalDocType;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface DocumentUploadProps {
  role: string;
  documents: Document[];
  onDocumentAdd: (document: Document) => void;
  onDocumentRemove: (id: string) => void;
  onComplete: () => void;
}

interface DocumentTypeOption {
  id: IdType | LegalDocType;
  title: string;
  description: string;
}

const ID_TYPES: DocumentTypeOption[] = [
  {
    id: 'id_card',
    title: "ID Card",
    description: "Valid national ID card",
  },
  {
    id: 'passport',
    title: 'Passport',
    description: 'Valid passport',
  },
  {
    id: 'driver_license',
    title: "Driver's License",
    description: 'Valid driver\'s license',
  },
  {
    id: 'residence_permit',
    title: 'Residence Permit',
    description: 'Valid residence permit',
  },
];

const LEGAL_TYPES: DocumentTypeOption[] = [
  {
    id: 'business',
    title: 'Business License',
    description: 'Business registration or equivalent',
  },
  {
    id: 'certification',
    title: 'Certification',
    description: 'Professional certification or diploma',
  },
  {
    id: 'work_permit',
    title: 'Work Permit',
    description: 'Work authorization',
  },
  {
    id: 'insurance',
    title: 'Insurance',
    description: 'Professional insurance certificate',
  },
  {
    id: 'experience',
    title: 'Experience Proof',
    description: 'Recommendation letter or contract',
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
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
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.id}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg mb-2 flex items-center justify-between"
              onClick={() => {
                onSelect(option);
                onClose();
              }}
            >
              <div>
                <h4 className="font-medium text-gray-900">{option.title}</h4>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocumentUpload({
  role,
  documents,
  onDocumentAdd,
  onDocumentRemove,
  onComplete,
}: DocumentUploadProps) {
  // const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requirements = [
    {
      id: 'identity',
      title: "ID Document",
      description: "Valid ID card or passport",
      required: true,
    },
    {
      id: 'legal',
      title: 'Legal Document',
      description: role === 'Entrepreneur' 
        ? 'Business registration document'
        : role === 'Technician'
        ? 'Professional certification'
        : 'Work permit or relevant documentation',
      required: true,
    },
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedRequirement) return;

    try {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5MB limit');
        return;
      }

      const preview = URL.createObjectURL(file);
      const documentType = selectedRequirement === 'identity' ? ID_TYPES[0].id : LEGAL_TYPES[0].id;

      const newDoc: Document = {
        id: uuidv4(),
        type: selectedRequirement,
        documentType,
        file,
        preview,
        status: 'pending',
      };

      onDocumentAdd(newDoc);
      simulateUpload(newDoc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }
  }, [selectedRequirement, onDocumentAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const simulateUpload = (docId: string) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        onDocumentAdd({
          ...documents.find(d => d.id === docId)!,
          status: 'uploading',
          progress,
        });
      } else {
        clearInterval(interval);
        onDocumentAdd({
          ...documents.find(d => d.id === docId)!,
          status: 'completed',
          progress: 100,
        });
        setIsUploading(false);
      }
    }, 200);
  };

  const handleSubmit = () => {
    const requiredDocs = requirements.filter(r => r.required);
    const uploadedRequiredDocs = documents.filter(d => 
      requiredDocs.some(r => r.id === d.type && d.status === 'completed')
    );

    if (uploadedRequiredDocs.length < requiredDocs.length) {
      setError('Please upload all required documents');
      return;
    }

    onComplete();
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Upload Documents</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide the required documents to verify your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {requirements.map((req) => {
              const doc = documents.find((d) => d.type === req.id);
              
              return (
                <div key={req.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {req.title}
                        {req.required && <span className="text-red-500">*</span>}
                      </h3>
                      <p className="text-sm text-gray-500">{req.description}</p>
                    </div>
                    {doc?.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  {doc ? (
                    <div className="space-y-4">
                      <div className="relative">
                        {doc.preview && (
                          <img
                            src={doc.preview}
                            alt="Document preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        {doc.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-white text-center">
                              <p className="mb-2">Uploading...</p>
                              <p>{doc.progress}%</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {doc.status === 'completed' && (
                        <button
                          onClick={() => onDocumentRemove(doc.id)}
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        isDragActive ? 'border-primary-DEFAULT bg-primary-light/10' : 'border-gray-300'
                      }`}
                      onClick={() => setSelectedRequirement(req.id)}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p className="pl-1">
                            Drag and drop a file here, or click to select
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-DEFAULT hover:bg-primary-dark'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}