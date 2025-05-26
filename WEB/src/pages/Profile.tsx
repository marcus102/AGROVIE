import { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  LogOut,
  User,
  Phone,
  Globe,
  Briefcase,
  CheckCircle,
  MapPin,
  Award,
  Code,
  MessageSquare,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Language, Translations } from "../types";

interface HomeProps {
  language: Language;
  translations: Translations[Language];
}

export function ProfilePage({ translations }: HomeProps) {
  const { profile, logout } = useAdminStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    profile_picture: profile?.profile_picture || "",
  } as {
    full_name: string;
    phone: string;
    profile_picture: string | ArrayBuffer | null;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically call an API to update the user profile
    console.log("Updating profile with:", formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-background-light dark:bg-gray-900/80 min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="relative bg-primary-DEFAULT py-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.h1
              variants={slideIn}
              className="text-4xl font-bold text-white font-montserrat mb-4"
            >
              My Profile
            </motion.h1>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-primary-DEFAULT/10 p-6 flex flex-col items-center">
            <div className="relative mb-4">
              {formData.profile_picture ? (
                <img
                  src={
                    typeof formData.profile_picture === "string"
                      ? formData.profile_picture
                      : URL.createObjectURL(
                          new Blob([formData.profile_picture])
                        )
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-light/20 flex items-center justify-center border-4 border-primary-light shadow-md">
                  <User className="h-16 w-16 text-primary" />
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-0 right-0">
                  <label className="bg-primary-DEFAULT text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors duration-200 cursor-pointer">
                    <Edit className="h-5 w-5 text-primary" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="text-2xl font-bold text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-300 focus:outline-none focus:border-primary-DEFAULT"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.full_name || "User"}
              </h2>
            )}
            <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className="flex-1 border-b border-gray-300 dark:bg-gray-900 text-gray-900 dark:text-white py-1 focus:outline-none focus:border-primary-DEFAULT"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                        Role
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {profile?.role?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                        Nationality
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {profile?.nationality?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                        Phone
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                        Location
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.actual_location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                        Status
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {profile?.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-white">Bio</h3>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.bio || "No bio provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrays */}
                {(profile?.skills?.length ?? 0) > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-white flex items-center mb-2">
                      <Code className="h-5 w-5 text-gray-500 dark:text-white mr-2" /> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile &&
                        profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary-DEFAULT"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {(profile?.languages ?? []).length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                      <Globe className="h-5 w-5 text-gray-500 mr-2" /> Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(profile?.languages ?? []).map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(profile?.certifications ?? []).length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                      <Award className="h-5 w-5 text-gray-500 mr-2" />{" "}
                      Certifications
                    </h3>
                    <ul className="space-y-2">
                      {(profile?.certifications ?? []).map((cert, index) => (
                        <li key={index} className="text-sm text-gray-900">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-white">
                    Member since
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : "Unknown"}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={logout}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
