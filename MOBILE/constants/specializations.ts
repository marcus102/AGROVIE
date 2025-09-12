// Worker specializations (Ouvrier)
export const workerSpecializations = [
  { label: 'Production végétale', value: 'crop_production_worker' },
  { label: 'Production animale', value: 'livestock_worker' },
  { label: 'Machinisme agricole', value: 'mechanized_worker' },
  { label: 'Polyvalent', value: 'specialized_worker' },
  { label: "Conducteur d'exploitation", value: 'seasonal_worker' },
  { label: 'Agroforesterie', value: 'agroforestry_worker' },
  { label: 'Pépinière', value: 'nursery_worker' },
  { label: 'Pisciculture', value: 'aquaculture_worker' },
  { label: 'Autre', value: 'other' },
];

// Technician specializations (Conseiller agricole)
export const advisorSpecializations = [
  { label: 'Horticulture (maraîchage)', value: 'horticulture_market_gardening' },
  { label: 'Culture fruitière (verger)', value: 'fruit_cultivation_orchard' },
  { label: 'Irrigation', value: 'irrigation' },
  { label: 'Machinisme agricole', value: 'agricultural_machinery' },
  { label: 'Élevage', value: 'livestock_farming' },
  { label: 'Agriculture intelligente', value: 'smart_agriculture' },
  { label: 'Drone agricole', value: 'agricultural_drone' },
  { label: 'Production grande culture', value: 'large_scale_production' },
  { label: 'Phytosanitaires', value: 'phytosanitary' },
  { label: 'Pédologie', value: 'soil_science' },
  { label: 'Aménagement agricole', value: 'agricultural_development' },
  { label: 'Montage de projet', value: 'project_management' },
  { label: 'Agro écologie', value: 'agroecology' },
  { label: "Gestion d'exploitation", value: 'farm_management' },
  { label: 'Agroalimentaire', value: 'agrifood' },
  { label: 'Foncier rural', value: 'rural_land' },
  { label: 'Pisciculture', value: 'aquaculture' },
  { label: 'Autre', value: 'other' },
];

// Role labels
export const roleLabels = {
  worker: 'Ouvrier',
  advisor: 'Conseiller agricole',
  entrepreneur: 'Entrepreneur',
};

// Experience level labels
export const experienceLevelLabels = {
  starter: 'Débutant',
  qualified: 'Qualifié',
  expert: 'Expert',
};

// Advantage options
export const advantageOptions = [
  { label: 'Repas fournis', value: 'meal' },
  { label: 'Logement', value: 'accommodation' },
  { label: 'Prime de performance', value: 'performance_bonus' },
  { label: 'Transport', value: 'transport' },
  { label: 'Autre', value: 'other' },
];

// Location suggestions for Burkina Faso
export const locationSuggestions = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Banfora',
  'Ouahigouya',
  'Pouytenga',
  'Kaya',
  'Tenkodogo',
  "Fada N'Gourma",
  'Gaoua',
  'Dédougou',
  'Réo',
  'Manga',
  'Ziniaré',
  'Kombissiri',
];