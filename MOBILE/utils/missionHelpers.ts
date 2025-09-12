import { Mission } from '@/types/mission';

// Format price for display
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice)
    ? 'Prix à négocier'
    : `${numPrice.toLocaleString()} FCFA`;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Filter missions based on user role and status
export const filterMissionsByRole = (
  missions: Mission[],
  userRole?: string
): Mission[] => {
  if (!userRole || userRole === 'entrepreneur') {
    return [];
  }

  return missions.filter((mission) => {
    // Only show online missions
    if (mission.status !== 'online') return false;

    // Filter based on user role
    if (userRole === 'worker' && mission.needed_actor !== 'worker')
      return false;
    if (userRole === 'advisor' && mission.needed_actor !== 'advisor')
      return false;

    return true;
  });
};

// Get advantage label in French
export const getAdvantageLabel = (advantage: string): string => {
  const labels = {
    transport: 'Transport',
    meal: 'Repas',
    accommodation: 'Hébergement',
    performance_bonus: 'Prime de performance',
    other: 'Autre',
  };
  return labels[advantage as keyof typeof labels] || advantage;
};

// Get experience level label in French
export const getExperienceLevelLabel = (level: string): string => {
  const labels = {
    starter: 'Débutant',
    qualified: 'Qualifié',
    expert: 'Expert',
  };
  return labels[level as keyof typeof labels] || level;
};
