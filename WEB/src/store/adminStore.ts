import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient, Session, User } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ActorRank = "Worker" | "Advisor" | "Entrepreneur";
export type ActorSpecialization =
  // Worker specializations
  | "crop_production_worker"
  | "livestock_worker"
  | "mechanized_worker"
  | "specialized_worker"
  | "seasonal_worker"
  | "agroforestry_worker"
  | "nursery_worker"
  | "aquaculture_worker"
  // Conseiller agricole
  | "horticulture_market_gardening"
  | "fruit_cultivation_orchard"
  | "irrigation"
  | "agricultural_machinery"
  | "livestock_farming"
  | "smart_agriculture"
  | "agricultural_drone"
  | "large_scale_production"
  | "phytosanitary"
  | "soil_science"
  | "agricultural_development"
  | "project_management"
  | "agroecology"
  | "farm_management"
  | "agrifood"
  | "rural_land"
  | "aquaculture"
  | "other";

export type ExperienceLevel = "starter" | "qualified" | "expert";
export type SurfaceUnit =
  | "hectares"
  | "square_meter"
  | "acres"
  | "square_kilometers";

export interface DynamicPricing {
  id: string;
  actor_rank: ActorRank;
  actor_specialization2: ActorSpecialization;
  experience_level: ExperienceLevel;
  surface_unit2: SurfaceUnit;
  specialization_base_price: number;
  experience_multiplier: number;
  surface_unit_price: number;
  price_per_kilometer: number;
  price_per_hour: number;
  equipments_price: number;
  advantages_reduction: number;
  metadata: Json;
  created_at: Date;
  updated_at: Date;
}

export type UserSuperRole =
  | "user"
  | "admin"
  | "organization"
  | "government"
  | "moderator"
  | "technology"
  | "law"
  | "finance";
export type UserNationality = "national" | "international" | "foreign";
export type Role = "Worker" | "Advisor" | "Entrepreneur";
export type AccountStatus = "healthy" | "warning" | "suspended" | "deleted";
export type PaymentStatus = "Completed" | "Pending" | "Failed" | "Refunded";
export type MissionStatus =
  | "in_review"
  | "online"
  | "accepted"
  | "rejected"
  | "completed"
  | "removed";
export type ActorsNeeded = "worker" | "advisor" | "entrepreneur";
export type RequiredExperience = "starter" | "qualified" | "expert";
export type UserStatus = "active" | "inactive" | "suspended";
export type VerificationStatus = "verified" | "not_verified";
export type DocStatus = "accepted" | "pending" | "rejected" | "not_uploaded";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  registrationDate: Date;
  account_status: AccountStatus;
  active: boolean;
  status: UserStatus;
  role: Role;
  super_role: UserSuperRole;
  nationality: UserNationality;
  specialization: string[];
  availability_status: string[];
  verification_status: VerificationStatus;
  docs_status: DocStatus;
  profile_picture: string;
  actual_location: string;
  availability_locations: string[];
  portfolio: string[];
  certifications: string[];
  skills: string[];
  work_experience: string[];
  education: string[];
  languages: string[];
  account_verified: boolean;
  metadata: JSON;
  created_at: Date;
}

export interface Mission {
  id: string;
  user_id: string;
  payment_id: string;
  mission_title: string;
  mission_description: string;
  location: string;
  start_date: Date;
  end_date: Date;
  needed_actor: ActorsNeeded;
  actor_specialization: JSON;
  needed_actor_amount: number;
  required_experience_level: RequiredExperience;
  applications: string[];
  surface_area: number;
  surface_unit: string;
  original_price: JSON;
  adjustment_price: JSON;
  final_price: number;
  proposed_advantages: string[];
  equipment: boolean;
  mission_images: string[];
  applicants: string[];
  metadata: JSON;
  creator: string;
  created_at: Date;
  updated_at: Date;
  status: MissionStatus;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  customer: {
    name: string;
    email: string;
  };
  description: string;
}

export type DocumentCategory =
  | "Reports"
  | "Contracts"
  | "Guidelines"
  | "Templates"
  | "Other";
export type DocumentStatus = "pending" | "approved" | "rejected";
export type IdType =
  | "id_card"
  | "passport"
  | "driver_license"
  | "residence_permit";
export type LegalDocType =
  | "business"
  | "certification"
  | "work_permit"
  | "insurance"
  | "experience";

export interface Document {
  id: string;
  user_id: string;
  identification_type: IdType;
  id_file_path: string;
  legal_document_type: LegalDocType;
  legal_file_path: string;
  rejection_reason?: string;
  status: DocumentStatus;
  created_at: Date;
  updated_at: Date;
  metadata: Json;
}

export type BlogPostStatus = "draft" | "online" | "offline" | "removed";
export type BlogTheme =
  | "Technology"
  | "Agriculture"
  | "Business"
  | "Education"
  | "Environment";

export interface BlogPost {
  id: string;
  user_id: string;
  images: string[];
  title: string;
  description: string;
  reading_time: number;
  theme: BlogTheme;
  updated_at: Date;
  created_at: Date;
  status: BlogPostStatus;
  tags: string[];
}

export type NotificationType = "update" | "news" | "message" | "ads";
export type NotificationStatus = "draft" | "online" | "deleted";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  context: string;
  type: NotificationType;
  status: NotificationStatus;
  action_url: string;
  image: string;
  read: boolean;
  created_at: Date;
}

export interface NotificationRead {
  id: string;
  user_id: string;
  notification_id: string;
  created_at: string;
}

export type LinkItem = {
  id: string;
  link_title: string;
  link_description: string;
  link: string;
  category: string;
  metadata: Json;
  is_active: boolean;
  updated_at: string | null;
  created_at: string;
};

export interface Feedback {
  id: string;
  user_name: string;
  user_role: string;
  rating: number;
  app_version: string;
  platform: string;
  user_agent: string;
  feedback_text: string;
  category: string;
  created_at: Date;
}

interface AdminState {
  links: LinkItem[];
  dynamicPricings: DynamicPricing[];
  feedbacks: Feedback[];
  currentPricing: DynamicPricing | null;
  loadingPricing: boolean;
  pricingError: string | null;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  users: Profile[];
  fetchUsers: () => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  createUser: (
    email: string,
    password: string,
    profileData: Partial<Profile>
  ) => Promise<void>;
  updateUser: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  missions: Mission[];
  documents: Document[];
  blogPosts: BlogPost[];
  payments: Payment[];
  notifications: Notification[];
  draftNotification: Partial<Notification> | null;
  readNotificationIds: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  userLogin: (email: string, password: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
  setUsers: (users: Profile[]) => void;
  setMissions: (missions: Mission[]) => void;
  setDocuments: (documents: Document[]) => void;
  setBlogPosts: (posts: BlogPost[]) => void;

  fetchMissions: () => Promise<void>;
  fetchMissionById: (id: string) => Promise<Mission | null>;
  createMission: (mission: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  updateMission: (id: string, data: Partial<Mission>) => void;
  updateDocument: (
    id: string,
    data: Partial<Document>,
    userId: string,
    profData: Partial<Profile>,
    userEmail: string
  ) => void;
  fetchDocumentsWithSignedUrls: () => Promise<Document[]>;
  deleteDocument: (id: string) => void;
  updateBlogPost: (id: string, data: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  createBlogPost: (post: BlogPost) => void;
  fetchBlogPosts: () => Promise<void>;
  resendVerificationCode: (
    userId: string,
    email: string,
    fullName: string
  ) => Promise<void>;

  // Notification Functions
  fetchNotifications: () => Promise<void>;
  fetchNotificationById: (id: string) => Promise<Notification | null>;
  createNotification: (
    notification: Partial<Notification>
  ) => Promise<Notification | null>;
  updateNotification: (
    id: string,
    updates: Partial<Notification>
  ) => Promise<Notification | null>;
  deleteNotification: (id: string) => Promise<void>;
  publishNotification: (notification: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
  fetchPricings: () => Promise<void>;
  fetchPricingById: (id: string) => Promise<DynamicPricing | null>;
  updatePricingById: (
    id: string,
    updates: Partial<DynamicPricing>
  ) => Promise<DynamicPricing | null>;
  fetchLinks: () => Promise<void>;
  createLink: (
    link: Omit<LinkItem, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateLink: (id: string, data: Partial<LinkItem>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  getUserPushToken: (userId: string) => Promise<string | null>;
  sendDocumentNotification: (
    pushToken: string | null,
    message: string
  ) => Promise<void>;

  getFeedbacks: () => Promise<void>;
  getFeedbackById: (id: string) => Promise<Feedback | null>;
  deleteFeedback: (id: string) => Promise<void>;
  updateFeedbackStatus: (id: string, status: string) => Promise<void>;
}

// Type guard for NotificationType
function isNotificationType(type: string): type is NotificationType {
  return ["update", "news", "message", "ads"].includes(type);
}

// Transformation function
function transformNotification(
  data: Notification,
  readIds: string[]
): Notification {
  if (!isNotificationType(data.type)) {
    console.warn(
      `Invalid notification type: ${data.type}, defaulting to 'update'`
    );
    data.type = "update";
  }

  return {
    ...data,
    type: data.type as NotificationType,
    read: readIds.includes(data.id),
    status: data.status || "draft",
  };
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      feedbacks: [],
      links: [],
      dynamicPricings: [],
      currentPricing: null,
      loadingPricing: false,
      pricingError: null,
      user: null,
      session: null,
      profile: null,
      users: [],
      missions: [],
      documents: [],
      blogPosts: [],
      payments: [],
      notifications: [],
      draftNotification: null,
      readNotificationIds: [],
      isAuthenticated: false,
      loading: false,
      error: null,

      // Authentication Functions
      adminLogin: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (authError) {
            console.error("Error logging in:", authError.message);
            throw new Error("Invalid credentials");
          }

          if (authData.user) {
            // Fetch the user's details from the database
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authData.user.id)
              .single();

            if (userError) {
              console.error("Error fetching user details:", userError.message);
              throw new Error("Unable to verify user role");
            }

            // Check if account is suspended or deleted
            if (userData.account_status === "Suspended") {
              throw new Error(
                "Your account has been suspended. Please contact support."
              );
            }
            if (userData.account_status === "Deleted") {
              throw new Error("Account not found. Please register again.");
            }

            // Check if the user is an admin
            if (userData?.super_role === "admin") {
              set({
                isAuthenticated: true,
                user: authData.user,
                session: authData.session,
                profile: userData,
              });

              // Store the token securely in localStorage
              const token = authData.session?.access_token;
              if (token) {
                localStorage.setItem("adminToken", token);
              }
            } else {
              throw new Error("Access denied: Only admins are allowed");
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error("Login failed:", err.message);
          } else {
            console.error("Login failed:", "An unknown error occurred");
          }
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      userLogin: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (authError) {
            console.error("Error logging in:", authError.message);
            throw new Error("Invalid credentials");
          }

          if (authData.user) {
            // Fetch the user's details from the database
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authData.user.id)
              .single();

            if (userError) {
              console.error("Error fetching user details:", userError.message);
              throw new Error("Unable to verify user role");
            }

            // Check if account is suspended or deleted
            if (userData.account_status === "Suspended") {
              throw new Error(
                "Your account has been suspended. Please contact support."
              );
            }
            if (userData.account_status === "Deleted") {
              throw new Error("Account not found. Please register again.");
            }

            set({
              isAuthenticated: true,
              user: authData.user,
              session: authData.session,
              profile: userData,
            });

            // Store the token securely in localStorage
            const token = authData.session?.access_token;
            if (token) {
              localStorage.setItem("adminToken", token);
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error("Login failed:", err.message);
          } else {
            console.error("Login failed:", "An unknown error occurred");
          }
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
      logout: () => set({ isAuthenticated: false }),

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const { data: users, error } = await supabase
            .from("profiles")
            .select("*");
          if (error) {
            console.error("Error fetching users:", error);
            set({ error: error.message });
            return;
          }
          set({ users });
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchUser: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const { data: profileData, error: profilError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (profilError) {
            console.error("Error fetching user:", profilError);
            set({ error: profilError.message });
            return;
          }
          set({ profile: profileData || null });
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },

      createUser: async (
        email: string,
        password: string,
        profileData: Partial<Profile>
      ) => {
        set({ loading: true, error: null });
        try {
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/verify-success`,
              },
            });

          if (authError) throw authError;
          if (!authData.user) throw new Error("User creation failed");

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: authData.user.id,
                full_name: profileData.full_name,
                role: profileData.role,
                phone: profileData.phone || null,
                verification_status: "not_verified",
                docs_status: "not_uploaded",
              },
            ])
            .select()
            .single();

          if (profileError || !profile) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw profileError || new Error("Profile creation failed");
          }

          set((state) => ({
            users: [...state.users, profile],
            user: authData.user,
          }));
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to sign up";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      updateUser: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("profiles")
            .update(data)
            .eq("id", id);
          if (error) {
            console.error("Error updating user:", error);
            set({ error: error.message });
            return;
          }
          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...data } : user
            ),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
          // Update account_status to "Deleted" instead of deleting the record
          const { error } = await supabase
            .from("profiles")
            .update({ account_status: "deleted" })
            .eq("id", id);

          if (error) {
            console.error("Error marking user as deleted:", error);
            set({ error: error.message });
            return;
          }

          // Optional: Sign out the user if they're currently logged in
          const { user } = get();
          if (user?.id === id) {
            await supabase.auth.signOut();
            set({ isAuthenticated: false, user: null, session: null });
          }

          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      setUsers: (users) => set({ users }),

      resendVerificationCode: async (
        userId: string,
        email: string,
        fullName: string
      ) => {
        set({ loading: true, error: null });
        try {
          // Call the edge function to resend verification code
          const response = await fetch(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/functions/v1/send-verification`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                  import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
              },
              body: JSON.stringify({
                userId,
                email,
                fullName,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to resend verification code");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to resend code",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      verifyOtp: async (code: string) => {
        set({ loading: true, error: null });
        try {
          const { user } = get();
          if (!user) throw new Error("No user found");

          const { data, error } = await supabase.rpc("verify_code", {
            user_id: user.id,
            input_code: code,
          });

          if (error) throw error;
          if (!data) throw new Error("Invalid verification code");

          // Update profile verification status
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ verification_status: "verified" })
            .eq("id", user.id);

          if (updateError) throw updateError;

          // Refresh profile data
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          // Delete the used verification code
          const { error: deleteError } = await supabase
            .from("verification_codes")
            .delete()
            .eq("code", code);

          if (deleteError) throw deleteError;

          // Update the local state with the new profile
          set((state) => ({
            users: state.users.map((user) =>
              user.id === user?.id ? { ...user, ...profile } : user
            ),
            profile: profile,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to verify email",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Mission Management Functions
      fetchMissions: async () => {
        set({ loading: true, error: null });
        try {
          const { data: missions, error } = await supabase
            .from("missions")
            .select("*");
          if (error) {
            console.error("Error fetching missions:", error);
            set({ error: error.message });
            return;
          }
          set({ missions });
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      fetchMissionById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data: mission, error } = await supabase
            .from("missions")
            .select("*")
            .eq("id", id)
            .single();
          if (error) {
            console.error(`Error fetching mission with ID ${id}:`, error);
            set({ error: error.message });
            return null;
          }
          return mission;
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },
      createMission: async (mission: Partial<Mission>) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("missions")
            .insert([mission]);
          if (error) {
            console.error("Error creating mission:", error);
            set({ error: error.message });
            return;
          }
          set((state) => ({
            missions: [...state.missions, ...(data || [])],
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      updateMission: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("missions")
            .update({ ...data })
            .eq("id", id)
            .select();
          if (error) {
            console.error(`Error updating mission with ID ${id}:`, error);
            set({ error: error.message });
            return;
          } else {
            console.log(`Updated mission with ID ${id}`);
          }
          set((state) => ({
            missions: state.missions.map((mission) =>
              mission.id === id ? { ...mission, ...data } : mission
            ),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      deleteMission: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("missions")
            .delete()
            .eq("id", id);
          if (error) {
            console.error(`Error deleting mission with ID ${id}:`, error);
            set({ error: error.message });
            return;
          }
          set((state) => ({
            missions: state.missions.filter((mission) => mission.id !== id),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      setMissions: (missions) => set({ missions }),

      // Document Management Functions
      fetchDocumentsWithSignedUrls: async () => {
        set({ loading: true, error: null });
        try {
          // Fetch all documents from the 'user_documents' table
          const { data: user_documents, error } = await supabase
            .from("user_documents")
            .select("*");

          if (error) {
            console.error("Error fetching documents:", error.message);
            return [];
          }

          if (!user_documents) {
            console.warn("No documents found.");
            return [];
          }

          // Generate signed URLs for id_file_path and legal_file_path
          const documentsWithSignedUrls = await Promise.all(
            user_documents.map(async (doc) => {
              const idFileSignedUrl = await generateSignedToken(
                doc.id_file_path
              );

              const legalFileSignedUrl = await generateSignedToken(
                doc.legal_file_path
              );

              return {
                ...doc,
                id_file_path: idFileSignedUrl,
                legal_file_path: legalFileSignedUrl,
              };
            })
          );

          set({
            documents: documentsWithSignedUrls,
            error: null,
            loading: false,
          });
          return documentsWithSignedUrls;
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
          console.error("Unexpected error fetching documents:", err);
          return [];
        } finally {
          set({ loading: false });
        }
      },
      // updateDocument: async (id, data, userId, profData) => {
      //   set({ loading: true, error: null });

      //   try {
      //     const { error: profileError } = await supabase
      //       .from("profiles")
      //       .update(profData)
      //       .eq("id", userId)
      //       .select();

      //     if (profileError) {
      //       console.error(
      //         `Error updating profile with ID ${id}:`,
      //         profileError
      //       );
      //       set({ error: profileError.message });
      //       return;
      //     }

      //     const { error } = await supabase
      //       .from("user_documents")
      //       .update(data)
      //       .eq("id", id)
      //       .select();

      //     if (error) {
      //       console.error(`Error updating document with ID ${id}:`, error);
      //       set({ error: error.message });
      //       return;
      //     } else {
      //       console.log(`Updated document with ID ${id} user ${userId}`);
      //     }

      //     const pushToken = await get().getUserPushToken(userId);

      //     if (data.status === "approved" || data.status === "rejected") {
      //       const message =
      //         data.status === "approved"
      //           ? "Your documents have been approved!"
      //           : "Your documents have been rejected. Please resubmit.";

      //       // Send notification
      //       await get().sendDocumentNotification(pushToken, message);
      //     }

      //     set((state) => ({
      //       documents: state.documents.map((document) =>
      //         document.id === id ? { ...document, ...data } : document
      //       ),
      //     }));
      //   } catch (err: unknown) {
      //     set({
      //       error:
      //         err instanceof Error ? err.message : "An unknown error occurred",
      //     });
      //   } finally {
      //     set({ loading: false });
      //   }
      // },

      updateDocument: async (id, data, userId, profData, userEmail) => {
        set({ loading: true, error: null });

        try {
          // Update profile first
          const { error: profileError } = await supabase
            .from("profiles")
            .update(profData)
            .eq("id", userId)
            .select();

          if (profileError) {
            console.error(
              `Error updating profile with ID ${id}:`,
              profileError
            );
            set({ error: profileError.message });
            return;
          }

          // Update document
          const { error } = await supabase
            .from("user_documents")
            .update(data)
            .eq("id", id)
            .select();

          if (error) {
            console.error(`Error updating document with ID ${id}:`, error);
            set({ error: error.message });
            return;
          } else {
            console.log(`Updated document with ID ${id} user ${userId}`);
          }

          // Get user profile data (full_name) from profiles table
          const { data: userProfile, error: profileFetchError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

          if (profileFetchError) {
            console.error("Error fetching user profile:", profileFetchError);
            // Continue without email if profile fetch fails
          }

          // Send push notification
          const pushToken = await get().getUserPushToken(userId);

          if (data.status === "approved" || data.status === "rejected") {
            const message =
              data.status === "approved"
                ? "Your documents have been approved!"
                : "Your documents have been rejected. Please resubmit.";

            // Send push notification
            await get().sendDocumentNotification(pushToken, message);

            // Send email notification if user data is available
            if (userEmail && userProfile?.full_name) {
              try {
                const emailPayload = {
                  userId: userId,
                  email: userEmail,
                  full_name: userProfile.full_name,
                  status: data.status,
                  rejectionReason: data.rejection_reason || null,
                };

                // Call the Supabase Edge Function for sending emails
                const { data: emailResponse, error: emailError } =
                  await supabase.functions.invoke(
                    "send-document-status-email",
                    {
                      body: emailPayload,
                    }
                  );

                if (emailError) {
                  console.error(
                    "Error sending document status email:",
                    emailError
                  );
                  // Don't fail the entire operation if email fails
                } else {
                  console.log(
                    "Document status email sent successfully:",
                    emailResponse
                  );
                }
              } catch (emailErr) {
                console.error(
                  "Failed to send document status email:",
                  emailErr
                );
                // Continue without failing the entire operation
              }
            } else {
              console.warn(
                "User data incomplete, skipping email notification - missing email or full_name"
              );
            }
          }

          // Update local state
          set((state) => ({
            documents: state.documents.map((document) =>
              document.id === id ? { ...document, ...data } : document
            ),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        })),
      setDocuments: (documents) => set({ documents }),

      // Blog Post Management Functions
      fetchBlogPosts: async () => {
        set({ loading: true, error: null });
        try {
          const { data: documents, error } = await supabase
            .from("documents")
            .select("*");

          if (error) {
            console.error("Error fetching blog posts:", error.message);
            set({ error: error.message });
            return;
          }

          if (!documents) {
            console.warn("No blog posts found.");
            set({ blogPosts: [] });
            return;
          }

          set({ blogPosts: documents as BlogPost[] });
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
          console.error("Unexpected error fetching blog posts:", err);
        } finally {
          set({ loading: false });
        }
      },
      createBlogPost: async (post) => {
        set({ loading: true, error: null });
        try {
          // Fetch the currently authenticated user
          const { data: user, error: userError } =
            await supabase.auth.getUser();
          if (userError || !user) {
            console.error(
              "Error fetching user ID:",
              userError?.message || "No user found"
            );
            set({ error: userError?.message || "Unable to fetch user ID" });
            return;
          }

          // Add the user ID to the blog post
          const postWithUserId = { ...post, user_id: user.user.id };

          // Insert the blog post into the database
          const { data, error } = await supabase
            .from("documents")
            .insert([postWithUserId]);
          if (error) {
            console.error("Error creating blog post:", error.message);
            set({ error: error.message });
            return;
          }

          // Update the local state
          set((state) => ({
            blogPosts: [...state.blogPosts, ...(data || [])],
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      updateBlogPost: async (id, data) => {
        set({ loading: true, error: null });
        try {
          // Fetch the currently authenticated user
          const { data: user, error: userError } =
            await supabase.auth.getUser();
          if (userError || !user) {
            console.error(
              "Error fetching user ID:",
              userError?.message || "No user found"
            );
            set({ error: userError?.message || "Unable to fetch user ID" });
            return;
          }

          // Add the user ID to the blog post data
          const updatedData = { ...data, user_id: user.user.id };

          // Update the blog post in the database
          const { error } = await supabase
            .from("documents")
            .update(updatedData)
            .eq("id", id);
          if (error) {
            console.error("Error updating blog post:", error.message);
            set({ error: error.message });
            return;
          }

          // Update the local state
          set((state) => ({
            blogPosts: state.blogPosts.map((post) =>
              post.id === id ? { ...post, ...updatedData } : post
            ),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      deleteBlogPost: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("documents")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Error deleting blog post:", error.message);
            set({ error: error.message });
            return;
          }
          set((state) => ({
            blogPosts: state.blogPosts.filter((post) => post.id !== id),
          }));
        } catch (err: unknown) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ loading: false });
        }
      },
      setBlogPosts: (posts) => set({ blogPosts: posts }),

      // Notification Functions
      setNotifications: (notifications: Notification[]) =>
        set({ notifications }),
      setDraftNotification: (notification: Partial<Notification> | null) =>
        set({ draftNotification: notification }),
      updateDraftNotification: (updates: Partial<Notification>) =>
        set((state) => ({
          draftNotification: state.draftNotification
            ? { ...state.draftNotification, ...updates }
            : updates,
        })),

      fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
          const { data: notificationsData, error: notificationsError } =
            await supabase
              .from("notifications")
              .select("*")
              .order("created_at", { ascending: false });

          if (notificationsError) throw notificationsError;

          const { data: readData } = await supabase
            .from("notifications_read")
            .select("notification_id");

          const readIds = (readData || []).map((r) => r.notification_id);

          set({
            notifications: notificationsData.map((n) =>
              transformNotification(n, readIds)
            ),
            readNotificationIds: readIds,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch notifications",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchNotificationById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;
          return transformNotification(data, get().readNotificationIds);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch notification",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      createNotification: async (notification) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("notifications")
            .insert({
              ...notification,
              user_id: get().user?.id,
              read: false,
              status: "draft",
            })
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            notifications: [
              transformNotification(data, state.readNotificationIds),
              ...state.notifications,
            ],
          }));
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create notification",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      updateNotification: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("notifications")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id
                ? transformNotification(data, get().readNotificationIds)
                : n
            ),
          }));
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update notification",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      deleteNotification: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete notification",
          });
        } finally {
          set({ loading: false });
        }
      },

      publishNotification: async (notificationId: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("notifications")
            .update({ status: "online" })
            .eq("id", notificationId);

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, status: "online" } : n
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to publish notification",
          });
        } finally {
          set({ loading: false });
        }
      },

      markAsRead: async (id) => {
        set({ loading: true });
        try {
          const { error } = await supabase
            .from("notifications_read")
            .upsert({ notification_id: id });

          if (error) throw error;

          set((state) => ({
            readNotificationIds: [...state.readNotificationIds, id],
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to mark as read",
          });
        } finally {
          set({ loading: false });
        }
      },

      markAllAsRead: async () => {
        set({ loading: true });
        try {
          const ids = get().notifications.map((n) => n.id);
          const insertData = ids.map((id) => ({ notification_id: id }));

          const { error } = await supabase
            .from("notifications_read")
            .upsert(insertData);

          if (error) throw error;

          set({
            readNotificationIds: ids,
            notifications: get().notifications.map((n) => ({
              ...n,
              read: true,
            })),
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to mark all as read",
          });
        } finally {
          set({ loading: false });
        }
      },

      getUnreadCount: () => {
        const { notifications, readNotificationIds } = get();
        return notifications.filter((n) => !readNotificationIds.includes(n.id))
          .length;
      },

      // Dynamic Pricing Functions
      fetchPricings: async () => {
        set({ loadingPricing: true, pricingError: null });
        try {
          const { data, error } = await supabase
            .from("dynamic_pricing")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ dynamicPricings: data || [] });
        } catch (error) {
          set({
            pricingError:
              error instanceof Error
                ? error.message
                : "Failed to fetch pricing data",
          });
        } finally {
          set({ loadingPricing: false });
        }
      },

      fetchPricingById: async (id: string) => {
        set({ loadingPricing: true, pricingError: null });
        try {
          const { data, error } = await supabase
            .from("dynamic_pricing")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;
          set({ currentPricing: data });
          return data;
        } catch (error) {
          set({
            pricingError:
              error instanceof Error
                ? error.message
                : "Failed to fetch pricing details",
          });
          return null;
        } finally {
          set({ loadingPricing: false });
        }
      },

      updatePricingById: async (
        id: string,
        updates: Partial<DynamicPricing>
      ) => {
        set({ loadingPricing: true, pricingError: null });
        try {
          const fullUpdates = {
            ...updates,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from("dynamic_pricing")
            .update(fullUpdates)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            dynamicPricings: state.dynamicPricings.map((p) =>
              p.id === id ? data : p
            ),
            currentPricing: data,
          }));

          return data;
        } catch (error) {
          set({
            pricingError:
              error instanceof Error
                ? error.message
                : "Failed to update pricing rule",
          });
          return null;
        } finally {
          set({ loadingPricing: false });
        }
      },

      // Link Management Functions
      fetchLinks: async () => {
        set({ loading: true, error: null });
        try {
          const { data: links, error } = await supabase
            .from("Links")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ links });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to fetch links",
          });
        } finally {
          set({ loading: false });
        }
      },

      createLink: async (linkData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("Links")
            .insert([linkData])
            .select();

          console.log("Creating link with data:", data, error);

          if (error) throw error;

          set((state) => ({
            links: [...(data || []), ...state.links],
          }));
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to create link",
          });
        } finally {
          set({ loading: false });
        }
      },

      updateLink: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("Links")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select();

          if (error) throw error;

          set((state) => ({
            links: state.links.map((link) =>
              link.id === id ? { ...link, ...updates } : link
            ),
          }));
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to update link",
          });
        } finally {
          set({ loading: false });
        }
      },

      deleteLink: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from("Links").delete().eq("id", id);

          if (error) throw error;

          set((state) => ({
            links: state.links.filter((link) => link.id !== id),
          }));
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to delete link",
          });
        } finally {
          set({ loading: false });
        }
      },

      // Push token for notifications

      getUserPushToken: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from("user_push_tokens")
            .select("expo_push_token")
            .eq("user_id", userId)
            .single();

          if (error) {
            console.error(
              `Error fetching push token for user ${userId}:`,
              error.message
            );
            return null;
          }

          return data?.expo_push_token;
        } catch (error) {
          console.error(`Unexpected error fetching push token:`, error);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      sendDocumentNotification: async (
        pushToken: string | null,
        message: string
      ) => {
        try {
          if (!pushToken) {
            console.warn("No push token provided, skipping notification.");
            return;
          }
          console.log("Sending push notification via Edge Function...");

          const { data, error } = await supabase.functions.invoke(
            "send-push-notification",
            {
              body: {
                to: pushToken,
                body: message,
                title: "Document Status Update",
                data: {
                  timestamp: new Date().toISOString(),
                  type: "document_status",
                },
              },
            }
          );

          console.log("Edge Function response:", data, error);

          if (error) {
            console.error("Edge Function error:", error);
            throw new Error(`Failed to send notification: ${error.message}`);
          }

          if (!data.success) {
            console.error("Push notification failed:", data);
            throw new Error(data.error || "Failed to send push notification");
          }

          console.log(
            "Push notification sent successfully via Edge Function:",
            data
          );
        } catch (error) {
          console.error(
            "Error sending document notification via Edge Function:",
            error
          );
          throw error;
        }
      },

      // Feedback
      getFeedbacks: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("feedbacks")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ feedbacks: data || [] });
        } catch (error) {
          console.error("Error fetching feedbacks via Supabase:", error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      getFeedbackById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("feedbacks")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;
          return data;
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Failed to get feedback",
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      deleteFeedback: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from("feedbacks")
            .delete()
            .eq("id", id);

          if (error) throw error;

          set((state) => ({
            feedbacks: state.feedbacks.filter((feedback) => feedback.id !== id),
          }));
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Failed to delete feedback",
          });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateFeedbackStatus: async (id: string, status: string) => {
        set({ loading: true, error: null });
        try {
          // Note: You'd need to add a 'status' column to your feedbacks table for this
          const { error } = await supabase
            .from("feedbacks")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id);

          if (error) throw error;

          set((state) => ({
            feedbacks: state.feedbacks.map((feedback) =>
              feedback.id === id ? { ...feedback, status } : feedback
            ),
          }));
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Failed to update feedback status",
          });
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),

    {
      name: "admin-storage",
      partialize: (state) => ({
        users: state.users,
        missions: state.missions,
        blogPosts: state.blogPosts,
      }),
    }
  )
);

async function generateSignedToken(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 60 * 60 * 10000000); // 1 hour expiration

    if (error) {
      console.error("Error generating signed URL:", error.message);
      return null;
    }

    return data?.signedUrl || null;
  } catch (err) {
    console.error("Unexpected error generating signed URL:", err);
    return null;
  }
}
