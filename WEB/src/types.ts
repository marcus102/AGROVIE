export type Language = "en" | "fr";

export interface PasswordRequirement {
  id: string;
  met: boolean;
  labelEn: string;
  labelFr: string;
}

export interface Translations {
  en: {
    header: {
      home: string;
      about: string;
      services: string;
      contact: string;
      faq: string;
      blog: string;
      register: string;
      login: string;
    };
    resetPassword: {
      title: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      requirements: string;
      success: string;
      error: string;
    };
    footer: {
      rights: string;
      followUs: string;
      privacy: string;
      terms: string;
      legal: string;
      contact: string;
      blog: string;
      services: string;
      about: string;
      faq: string;
      support: string;
      help: string;
      supportEmail: string;
      supportPhone: string;
      supportAddress: string;
    };
  };
  fr: {
    header: {
      home: string;
      about: string;
      services: string;
      contact: string;
      faq: string;
      blog: string;
      register: string;
      login: string;
    };
    resetPassword: {
      title: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      requirements: string;
      success: string;
      error: string;
    };
    footer: {
      rights: string;
      followUs: string;
      privacy: string;
      terms: string;
      legal: string;
      contact: string;
      blog: string;
      services: string;
      about: string;
      faq: string;
      support: string;
      help: string;
      supportEmail: string;
      supportPhone: string;
      supportAddress: string;
    };
  };
}
