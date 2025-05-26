import { create } from 'zustand';
import { RoleVerification, VerificationDocument } from '@/types/verification';

interface VerificationState {
  roleVerification: RoleVerification | null;
  loading: boolean;
  error: string | null;
  setRoleVerification: (verification: RoleVerification) => void;
  updateDocument: (document: VerificationDocument) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  roleVerification: null,
  loading: false,
  error: null,
  setRoleVerification: (verification) => set({ roleVerification: verification }),
  updateDocument: (document) => 
    set((state) => ({
      roleVerification: state.roleVerification ? {
        ...state.roleVerification,
        documents: state.roleVerification.documents.map(doc =>
          doc.id === document.id ? document : doc
        ),
      } : null,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));