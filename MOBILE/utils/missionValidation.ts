import { FormData, FormErrors } from '@/components/mission/create/types';

export const validateStep = (step: number, formData: FormData): FormErrors => {
  const newErrors: FormErrors = {};

  switch (step) {
    case 1:
      if (!formData.mission_title.trim())
        newErrors.mission_title = 'Le titre est requis';
      if (!formData.mission_description.trim())
        newErrors.mission_description = 'La description est requise';
      if (!formData.location.trim())
        newErrors.location = 'La localisation est requise';
      break;
    case 2:
      if (!formData.start_date)
        newErrors.start_date = 'La date de début est requise';
      if (!formData.end_date) newErrors.end_date = 'La date de fin est requise';
      if (
        formData.start_date &&
        formData.end_date &&
        new Date(formData.start_date) >= new Date(formData.end_date)
      ) {
        newErrors.end_date = 'La date de fin doit être après la date de début';
      }
      break;
    case 3:
      if (!formData.actor_specialization)
        newErrors.actor_specialization = 'La spécialisation est requise';
      if (
        formData.actor_specialization === 'other' &&
        !formData.other_actor_specialization.trim()
      ) {
        newErrors.other_actor_specialization =
          'Veuillez préciser la spécialisation';
      }
      if (formData.needed_actor_amount < 1)
        newErrors.needed_actor_amount = 'Le nombre doit être supérieur à 0';
      break;
    case 4:
      if (
        !formData.original_price ||
        parseFloat(formData.original_price) <= 0
      ) {
        newErrors.original_price = 'Le prix doit être supérieur à 0';
      }
      break;
  }

  return newErrors;
};
