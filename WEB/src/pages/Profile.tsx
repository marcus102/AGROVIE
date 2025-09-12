import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  Edit,
  LogOut,
  User,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  GraduationCap,
  Folder,
  Info,
  RefreshCw,
  Calendar,
  Shield,
  FileText,
  Loader2,
  Plus,
  X,
  Camera,
} from "lucide-react";
import { useAdminStore, Profile } from "../store/adminStore";
import { fadeIn, staggerContainer } from "../utils/animations";
import { Language, Translations } from "../types";

interface ProfileProps {
  language: Language;
  translations: Translations[Language];
}

interface ProfileImageProps {
  profile: Profile | null;
  isEditing: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FormData {
  full_name: string;
  phone: string;
  actual_location: string;
  bio: string;
  portfolio: string[];
  certifications: string[];
  languages: string[];
  skills: string[];
  work_experience: string[];
  availability_locations: string[];
  specialization: string[];
  education: string[];
}

// Define role translations
const ROLE_TRANSLATIONS = {
  worker: 'Ouvrier',
  advisor: 'Conseiller Agricole',
  entrepreneur: 'Entrepreneur',
  admin: 'Administrateur',
};

// Define status translations
const STATUS_TRANSLATIONS = {
  pending: 'En Attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  verified: 'Vérifié',
  unverified: 'Non Vérifié',
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
};

// Memoized ProfileImage component
const ProfileImage = ({ profile, isEditing, onFileChange }: ProfileImageProps) => (
  <div className="relative mb-4">
    {profile?.profile_picture ? (
      <img
        src={
          typeof profile.profile_picture === "string"
            ? profile.profile_picture
            : URL.createObjectURL(new Blob([profile.profile_picture]))
        }
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
      />
    ) : (
      <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
        <User className="h-16 w-16 text-white" />
      </div>
    )}
    {isEditing && (
      <div className="absolute bottom-0 right-0">
        <label className="bg-white text-primary p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>
    )}
  </div>
);

// Memoized ProfileInfo component
interface ProfileInfoProps {
  profile: Profile | null;
  isEditing: boolean;
  formData: FormData;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileInfo = ({ profile, isEditing, formData, onNameChange }: ProfileInfoProps) => (
  <div className="text-center">
    {isEditing ? (
      <input
        type="text"
        name="full_name"
        value={formData.full_name}
        onChange={onNameChange}
        className="text-3xl font-bold text-center bg-transparent text-white border-b-2 border-white/30 focus:outline-none focus:border-white placeholder-white/70 mb-3"
        placeholder="Nom complet"
      />
    ) : (
      <h2 className="text-3xl font-bold text-white mb-3">
        {profile?.full_name || "Nom Inconnu"}
      </h2>
    )}

    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
      <div className="inline-flex bg-white/20 px-4 py-2 rounded-full">
        <span className="text-white font-medium">
          {ROLE_TRANSLATIONS[profile?.role as keyof typeof ROLE_TRANSLATIONS] || "Inconnu"}
        </span>
      </div>

      {profile?.account_verified && (
        <div className="inline-flex bg-green-500/20 px-4 py-2 rounded-full">
          <Shield className="h-4 w-4 text-green-300 mr-2" />
          <span className="text-green-300 font-medium">Vérifié</span>
        </div>
      )}

      <div className={`inline-flex px-4 py-2 rounded-full ${profile?.active
        ? 'bg-green-500/20 text-green-300'
        : 'bg-red-500/20 text-red-300'
        }`}>
        <span className="font-medium">
          {profile?.active ? 'Actif' : 'Inactif'}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-center text-white/90 mb-2">
      <MapPin className="h-4 w-4 mr-2" />
      <span>{profile?.actual_location || "Localisation Inconnue"}</span>
    </div>

    <div className="flex items-center justify-center text-white/80 text-sm">
      <Calendar className="h-4 w-4 mr-2" />
      <span>
        Membre depuis {profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString('fr-FR')
          : "Date inconnue"}
      </span>
    </div>
  </div>
);

// ArrayInputSection component for dynamic array fields
interface ArrayInputSectionProps {
  label: string;
  Icon: React.ElementType;
  items: string[];
  onUpdateItems: (newItems: string[]) => void;
  placeholder?: string;
}

const ArrayInputSection = ({ 
  label, 
  Icon, 
  items, 
  onUpdateItems, 
  placeholder = "Entrez votre information" 
}: ArrayInputSectionProps) => {
  const handleInputChange = useCallback(
    (text: string, index: number) => {
      const newItems = [...items];
      newItems[index] = text;
      onUpdateItems(newItems);
    },
    [items, onUpdateItems]
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onUpdateItems(newItems);
    },
    [items, onUpdateItems]
  );

  const addNewInput = useCallback(() => {
    onUpdateItems([...items, ""]);
  }, [items, onUpdateItems]);

  // Ensure there's always at least one input
  const displayItems = useMemo(() => {
    if (items.length === 0 || items[items.length - 1] !== '') {
      return [...items, ''];
    }
    return items;
  }, [items]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="inline h-4 w-4 mr-2" />
        {label}
      </label>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onBlur={() => {
                // Auto-add new input when user finishes typing in the last input
                if (index === displayItems.length - 1 && item.trim() !== '' && displayItems.length === items.length + 1) {
                  // This means we're in the extra empty input and it has content
                  const newItems = [...items, item];
                  onUpdateItems(newItems);
                }
              }}
              placeholder={placeholder}
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {displayItems.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addNewInput}
          className="flex items-center gap-2 px-3 py-2 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-md transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Ajouter un autre champ</span>
        </button>
      </div>
    </div>
  );
};

interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  details: Array<{ label: string; value: unknown }>;
  renderDetailValue: (value: unknown, label: string) => React.ReactNode;
  delay: number;
}

// Memoized ProfileSection component
const ProfileSection = ({
  title,
  icon,
  details,
  renderDetailValue,
  delay = 0
}: ProfileSectionProps) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: delay / 1000 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
  >
    <div className="flex items-center mb-6">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>

    <div className="space-y-4">
      {details.map((detail: unknown, index: number) => {
        const d = detail as { label: string; value: unknown };
        return (
          <div
            key={index}
            className={`pb-4 ${index !== details.length - 1
              ? "border-b border-gray-100 dark:border-gray-700"
              : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {d.label}
            </p>
            {renderDetailValue(d.value, d.label)}
          </div>
        );
      })}
    </div>
  </motion.div>
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Erreur de chargement
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
      >
        Réessayer
      </button>
    </div>
  </div>
);

export function ProfilePage({ translations }: ProfileProps) {
  const { profile, logout, fetchUser, updateUser } = useAdminStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: "",
    actual_location: "",
    bio: "",
    portfolio: [],
    certifications: [],
    languages: [],
    skills: [],
    work_experience: [],
    availability_locations: [],
    specialization: [],
    education: [],
  });

  const { profileId } = useParams();

  // Auto-fetch profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!profile) {
        setIsLoading(true);
        setError(null);
        try {
          await fetchUser(profileId || "");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [profile, fetchUser]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        actual_location: profile.actual_location || "",
        bio: profile.bio || "",
        portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : [],
        certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        work_experience: Array.isArray(profile.work_experience) ? profile.work_experience : [],
        availability_locations: Array.isArray(profile.availability_locations) ? profile.availability_locations : [],
        specialization: Array.isArray(profile.specialization) ? profile.specialization : [],
        education: Array.isArray(profile.education) ? profile.education : [],
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayUpdate = useCallback((field: keyof FormData, value: string[]) => {
    // Filter out empty strings when updating
    const cleanedValue = value.filter((item) => item.trim() !== '');
    setFormData((prev) => ({ ...prev, [field]: cleanedValue }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        // Handle file upload logic here
        // This would typically involve uploading to your storage service
        console.log("File selected:", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up formData before saving - remove empty strings from arrays
      const cleanedFormData = {
        ...formData,
        portfolio: formData.portfolio.filter((item) => item.trim() !== ''),
        certifications: formData.certifications.filter((item) => item.trim() !== ''),
        languages: formData.languages.filter((item) => item.trim() !== ''),
        skills: formData.skills.filter((item) => item.trim() !== ''),
        work_experience: formData.work_experience.filter((item) => item.trim() !== ''),
        availability_locations: formData.availability_locations.filter((item) => item.trim() !== ''),
        specialization: formData.specialization.filter((item) => item.trim() !== ''),
        education: formData.education.filter((item) => item.trim() !== ''),
      };

      await updateUser(profileId || "", cleanedFormData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchUser(profileId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUser]);

  const handleLogout = useCallback(() => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
    }
  }, [logout]);

  const formatValue = useCallback((value: unknown) => {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : null;
    }

    const stringValue = String(value)
      .replace(/[\[\]']+/g, '')
      .replace(/([a-z])([A-Z])/g, '$1, $2')
      .trim();

    return stringValue || null;
  }, []);

  const renderDetailValue = useCallback(
    (value: unknown, label: string) => {
      const formattedValue = formatValue(value);

      if (!formattedValue) {
        return (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Non Disponible
          </p>
        );
      }

      if (
        label === 'Expérience Professionnelle' &&
        !isNaN(Number(formattedValue))
      ) {
        return (
          <p className="text-gray-900 dark:text-white">
            {formattedValue} ans d'expérience
          </p>
        );
      }

      if (formattedValue.includes(',')) {
        return (
          <div className="flex flex-wrap gap-2">
            {formattedValue.split(',').map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {item.trim()}
              </span>
            ))}
          </div>
        );
      }

      return (
        <p className="text-gray-900 dark:text-white">
          {formattedValue}
        </p>
      );
    },
    [formatValue]
  );

  // Array field configurations
  const arrayFieldConfigs = useMemo(() => [
    { field: 'portfolio' as keyof FormData, label: 'Liens Site Web', Icon: Globe, placeholder: 'https://mon-site.com' },
    { field: 'certifications' as keyof FormData, label: 'Certifications', Icon: FileText, placeholder: 'Nom de la certification' },
    { field: 'languages' as keyof FormData, label: 'Langues', Icon: Globe, placeholder: 'Français, Anglais, etc.' },
    { field: 'skills' as keyof FormData, label: 'Compétences', Icon: Briefcase, placeholder: 'Nom de la compétence' },
    { field: 'work_experience' as keyof FormData, label: 'Expérience professionnelle', Icon: Briefcase, placeholder: 'Description de l\'expérience' },
    { field: 'availability_locations' as keyof FormData, label: 'Zones de disponibilité', Icon: MapPin, placeholder: 'Nom de la zone' },
    { field: 'specialization' as keyof FormData, label: 'Spécialisations', Icon: GraduationCap, placeholder: 'Domaine de spécialisation' },
    { field: 'education' as keyof FormData, label: 'Éducation', Icon: GraduationCap, placeholder: 'Formation ou diplôme' },
  ], []);

  // Memoize profile sections data
  const profileSections = useMemo(() => {
    if (!profile) return [];

    return [
      {
        title: 'À Propos',
        icon: <Info className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Bio', value: profile.bio },
          { label: 'Nationalité', value: profile.nationality }
        ],
        delay: 300,
      },
      {
        title: 'Contact',
        icon: <Phone className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Email', value: profile.email },
          { label: 'Téléphone', value: profile.phone }
        ],
        delay: 400,
      },
      {
        title: 'Statut et Vérification',
        icon: <Shield className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Statut du Compte', value: STATUS_TRANSLATIONS[profile.account_status as keyof typeof STATUS_TRANSLATIONS] || profile.account_status },
          { label: 'Statut de Vérification', value: STATUS_TRANSLATIONS[profile.verification_status as keyof typeof STATUS_TRANSLATIONS] || profile.verification_status },
          { label: 'Statut des Documents', value: STATUS_TRANSLATIONS[profile.docs_status as keyof typeof STATUS_TRANSLATIONS] || profile.docs_status },
          { label: 'Statut de Disponibilité', value: profile.availability_status }
        ],
        delay: 500,
      },
      {
        title: 'Compétences et Expérience',
        icon: <Briefcase className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Compétences', value: profile.skills },
          { label: 'Expérience Professionnelle', value: profile.work_experience },
          { label: 'Spécialisation', value: profile.specialization },
        ],
        delay: 600,
      },
      {
        title: 'Éducation et Certifications',
        icon: <GraduationCap className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Éducation', value: profile.education },
          { label: 'Certifications', value: profile.certifications },
        ],
        delay: 700,
      },
      {
        title: 'Langues',
        icon: <Globe className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Langues', value: profile.languages },
        ],
        delay: 800,
      },
      {
        title: 'Portfolio',
        icon: <Folder className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Portfolio', value: profile.portfolio },
        ],
        delay: 900,
      },
      {
        title: 'Zone de disponibilité',
        icon: <MapPin className="h-5 w-5 text-primary" />,
        details: [
          { label: 'Zones', value: profile.availability_locations },
        ],
        delay: 1000,
      },
    ].filter(section => section.details.some(detail => detail.value));
  }, [profile]);

  // Show loading state
  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error && !profile) {
    return <ErrorDisplay message={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section with Gradient */}
      <motion.div
        className="relative bg-gradient-to-br from-primary to-primary-dark py-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-black/20" />

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <ProfileImage
              profile={profile}
              isEditing={isEditing}
              onFileChange={handleFileChange}
            />
            <ProfileInfo
              profile={profile}
              isEditing={isEditing}
              formData={formData}
              onNameChange={handleChange}
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center space-x-4 mb-8"
        >
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Annuler' : 'Modifier le Profil'}
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors duration-200 flex items-center shadow-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se Déconnecter
          </button>
        </motion.div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Phone Input */}
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Numéro de téléphone"
                    className="flex-1 border-b border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Location Input */}
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <input
                    type="text"
                    name="actual_location"
                    value={formData.actual_location}
                    onChange={handleChange}
                    placeholder="Localisation actuelle"
                    className="flex-1 border-b border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Array Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {arrayFieldConfigs.map(({ field, label, Icon, placeholder }) => (
                  <ArrayInputSection
                    key={field}
                    label={label}
                    Icon={Icon}
                    items={formData[field] as string[]}
                    onUpdateItems={(newItems) => handleArrayUpdate(field, newItems)}
                    placeholder={placeholder}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 flex items-center"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Profile Sections */}
        <div className="space-y-6">
          {profileSections.map((section, index) => (
            <ProfileSection
              key={index}
              title={section.title}
              icon={section.icon}
              details={section.details}
              renderDetailValue={renderDetailValue}
              delay={section.delay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}