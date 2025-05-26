import { create } from 'zustand';
import { 
  MatchingCriteria, 
  MatchResult, 
  PaymentStatus, 
  ContractStatus,
  DisputeStatus,
  Location 
} from '@/types/matching';

interface MatchingState {
  criteria: MatchingCriteria | null;
  matches: MatchResult[];
  selectedMatch: MatchResult | null;
  paymentStatus: PaymentStatus | null;
  contractStatus: ContractStatus | null;
  disputeStatus: DisputeStatus | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCriteria: (criteria: MatchingCriteria) => void;
  findMatches: (criteria: MatchingCriteria) => Promise<void>;
  selectMatch: (match: MatchResult) => void;
  initiatePayment: (phoneNumber: string) => Promise<void>;
  verifyPayment: (otpCode: string) => Promise<void>;
  acceptContract: (role: 'worker' | 'employer') => Promise<void>;
  rejectContract: (role: 'worker' | 'employer', reason: string) => Promise<void>;
  initiateDispute: (reason: string, description: string) => Promise<void>;
  calculateDistance: (point1: Location, point2: Location) => number;
  calculatePrice: (baseRate: number, distance: number, complexity: number) => number;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  criteria: null,
  matches: [],
  selectedMatch: null,
  paymentStatus: null,
  contractStatus: null,
  disputeStatus: null,
  loading: false,
  error: null,

  setCriteria: (criteria) => set({ criteria }),

  findMatches: async (criteria) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate matches based on criteria
      const matches = simulateMatching(criteria);
      set({ matches, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to find matches',
        loading: false 
      });
    }
  },

  selectMatch: (match) => set({ selectedMatch: match }),

  initiatePayment: async (phoneNumber) => {
    set({ loading: true, error: null });
    try {
      // Simulate Orange Money API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set({
        paymentStatus: {
          status: 'pending',
          amount: get().selectedMatch?.pricing.finalPrice || 0,
          commission: (get().selectedMatch?.pricing.finalPrice || 0) * 0.3,
          workerAmount: (get().selectedMatch?.pricing.finalPrice || 0) * 0.7,
          paymentMethod: 'orange_money',
          phoneNumber,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Payment initiation failed',
        loading: false,
      });
    }
  },

  verifyPayment: async (otpCode) => {
    set({ loading: true, error: null });
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpCode.length !== 6) {
        throw new Error('Invalid OTP code');
      }

      set({
        paymentStatus: {
          ...get().paymentStatus!,
          status: 'completed',
          otpCode,
          transactionId: Math.random().toString(36).substring(7),
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Payment verification failed',
        loading: false,
      });
    }
  },

  acceptContract: async (role) => {
    set({ loading: true, error: null });
    try {
      // Simulate contract acceptance
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentStatus = get().contractStatus || {
        status: 'pending',
        acceptedByWorker: false,
        acceptedByEmployer: false,
        terms: [
          'Respect des horaires de travail',
          'Utilisation appropriée du matériel',
          'Respect des normes de sécurité',
          'Confidentialité des informations',
        ],
        signatures: {},
      };

      const newStatus = {
        ...currentStatus,
        acceptedByWorker: role === 'worker' ? true : currentStatus.acceptedByWorker,
        acceptedByEmployer: role === 'employer' ? true : currentStatus.acceptedByEmployer,
        signatures: {
          ...currentStatus.signatures,
          [role]: new Date().toISOString(),
        },
      };

      // If both parties have accepted, mark as accepted
      if (newStatus.acceptedByWorker && newStatus.acceptedByEmployer) {
        newStatus.status = 'accepted';
        newStatus.startDate = new Date().toISOString();
      }

      set({ contractStatus: newStatus, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Contract acceptance failed',
        loading: false,
      });
    }
  },

  rejectContract: async (role, reason) => {
    set({ loading: true, error: null });
    try {
      // Simulate contract rejection
      await new Promise(resolve => setTimeout(resolve, 1000));

      set({
        contractStatus: {
          ...get().contractStatus!,
          status: 'rejected',
          signatures: {
            ...get().contractStatus?.signatures,
            [role]: new Date().toISOString(),
          },
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Contract rejection failed',
        loading: false,
      });
    }
  },

  initiateDispute: async (reason, description) => {
    set({ loading: true, error: null });
    try {
      // Simulate dispute creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      set({
        disputeStatus: {
          isDisputed: true,
          reason,
          description,
          status: 'open',
          timestamp: new Date().toISOString(),
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initiate dispute',
        loading: false,
      });
    }
  },

  calculateDistance: (point1, point2) => {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  calculatePrice: (baseRate, distance, complexity) => {
    const distanceFee = distance * get().criteria?.maxDistance || 0;
    return baseRate * complexity + distanceFee;
  },
}));

// Helper functions
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function simulateMatching(criteria: MatchingCriteria): MatchResult[] {
  // Simulate matching algorithm
  const matches: MatchResult[] = [];
  const numberOfMatches = Math.floor(Math.random() * 5) + 3; // 3-7 matches

  for (let i = 0; i < numberOfMatches; i++) {
    const skillMatch = Math.random() * 0.4 + 0.6; // 60-100%
    const distanceScore = Math.random() * 0.3 + 0.7; // 70-100%
    const availabilityScore = Math.random() * 0.2 + 0.8; // 80-100%
    const ratingScore = Math.random() * 0.1 + 0.9; // 90-100%

    const baseRate = criteria.jobType === 'technician' ? 25000 : 15000; // FCFA per day
    const distanceFee = Math.random() * 1000 + 500; // 500-1500 FCFA per km
    const complexityMultiplier = Math.random() * 0.5 + 1.0; // 1.0-1.5

    matches.push({
      userId: `user_${Math.random().toString(36).substring(7)}`,
      score: (skillMatch + distanceScore + availabilityScore + ratingScore) / 4,
      skillMatch,
      distanceScore,
      availabilityScore,
      ratingScore,
      pricing: {
        baseRate,
        distanceFee,
        complexityMultiplier,
        finalPrice: baseRate * complexityMultiplier + distanceFee,
      },
    });
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}