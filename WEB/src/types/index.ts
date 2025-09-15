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
      logout: string;
      profile: string;
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
      description: string;
      company: string;
      rights: string;
      followUs: string;
      poweredBy: string;
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
      downloadApp: string;
      downloadIOS: string;
      downloadAndroid: string;
    };
    home: {
      trusted: string;
      title: string;
      subtitle: string;
      getStarted: string;
      learnMore: string;
      whyUs: string;
      whyUsDescription: string;
      conectExperts: string;
      conectExpertsDescription: string;
      findOpportunities: string;
      findOpportunitiesDescription: string;
      securePlatform: string;
      securePlatformDescription: string;
      solutionsForEveryNeeds: string;
      solutionsForEveryNeedsDescription: string;
      forFarmers: string;
      forFarmersDescription: string;
      farmerBenefits: string[];
      forTechnicians: string;
      forTechniciansDescription: string;
      forTechniciansBenefits: string[];
      forEntrepreneurs: string;
      forEntrepreneursDescription: string;
      forEntrepreneursBenefits: string[];
      getStartedButton: string;
      readyToGetStarted: string;
      joinOurNetwork: string;
      connect: string;
      login: string;
      contactUsButton: string;
      downloadAppTitle: string;
      downloadAppDescription: string;
    };
    about: {
      title: string;
      description: string;
      mission: string;
      missionDescription: string;
      ourValue: string;
      ourValueDescription: string;
      communityFirst: string;
      communityFirstDescription: string;
      innovationDriven: string;
      innovationDrivenDescription: string;
      sustainabilityFocused: string;
      sustainabilityFocusedDescription: string;
      excellence: string;
      excellenceDescription: string;
      ourJourney: string;
      ourJourneyDescription: string;
      ourTeam: string;
      ourTeamDescription: string;
      learnMore: string;
    };
    services: {
      agriculturalSolution: string;
      title: string;
      description: string;
      getStarted: string;
      contactSales: string;
      solutionsForEveryNeed: string;
      solutionsForEveryNeedDescription: string;
      service1: {
        name: string;
        description: string;
        features: string[];
      };
      service2: {
        name: string;
        description: string;
        features: string[];
      };
      service3: {
        name: string;
        description: string;
        features: string[];
      };
      service4: {
        name: string;
        description: string;
        features: string[];
      };
      service5: {
        name: string;
        description: string;
        features: string[];
      };
      service6: {
        name: string;
        description: string;
        features: string[];
      };
      whatOurUsersSay: string;
      whatOurUsersSayDescription: string;
      readyToGetStarted: string;
      joinOurNetwork: string;
      connect: string;
      createAccountButton: string;
      learnMoreButton: string;
      feature: string;
      contactUsButton: string;
    };
    serviceDetail: {
      serviceNotFound: {
        title: string;
        description: string;
        backToServices: string;
      };
      professionalService: string;
      getStarted: string;
      contactSales: string;
      keyBenefits: {
        title: string;
        heading: string;
        description: string;
      };
      useCases: {
        title: string;
        heading: string;
        description: string;
      };
      successStories: {
        title: string;
        heading: string;
        description: string;
      };
      pricingPlans: {
        title: string;
        heading: string;
        description: string;
        mostPopular: string;
        free: string;
        custom: string;
        perMonth: string;
        contactSales: string;
      };
      readyToGetStarted: {
        heading: string;
        description: string;
        startFreeTrial: string;
      };
      networkBuilding: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      knowledgeExchange: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      partnershipFacilitation: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      verifiedExpertise: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      marketInsights: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      businessGrowth: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
    };
    contact: {
      tagline: string;
      title: string;
      description: string;
      form: {
        title: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        role: string;
        farmer: string;
        technician: string;
        entrepreneur: string;
        subject: string;
        subjectPlaceholder: string;
        message: string;
        messagePlaceholder: string;
        submit: string;
        submited: string;
        nameError: string;
        emailError: string;
        messageError: string;
        emailInvalid: string;
        messageLength: string;
        messageSent: string;
        messageSending: string;
        messageSendingError: string;
        messageSendingSuccess: string;
        success: string;
        error: string;
      };
      contactInfo: {
        title: string;
        description: string;
        visitUs: string;
        emailUs: string;
        callUs: string;
        businessHours: string;
        monday: string;
        friday: string;
        saturday: string;
        sunday: string;
        closed: string;
      };
    };
    faq: {
      tagline: string;
      title: string;
      description: string;
      searchPlaceholder: string;
      tags: string[];
      question1: {
        question: string;
        answer: string;
      };
      question2: {
        question: string;
        answer: string;
      };
      question3: {
        question: string;
        answer: string;
      };
      question4: {
        question: string;
        answer: string;
      };
      question5: {
        question: string;
        answer: string;
      };
      question6: {
        question: string;
        answer: string;
      };
      question7: {
        question: string;
        answer: string;
      };
      question8: {
        question: string;
        answer: string;
      };
      question9: {
        question: string;
        answer: string;
      };
      questionNotFound: string;
      stillHaveQuestions: string;
      cannotFind: string;
      contactSupportButton: string;
    };
    blog: {
      tagline: string;
      title: string;
      description: string;
      read: string;
      readMore: string;
      recentPosts: string;
      categories: string;
      searchPlaceholder: string;
      noResults: string;
      allCategories: string;
      technology: string;
      agriculture: string;
      innovation: string;
      sustainability: string;
      business: string;
      by: string;
    };
    // profile: {
    //   role: string;
    //   isVerified: string;
    //   insNotVerified: string;
    //   status: string;
    //   membershipDate: string;
    //   about: {}
    // };
    termsOfService: {
      title: string;
      lastUpdated: string;
      description: string;
      agreementToTerms: string;
      agreementToTermsContent: string;
      accountSecurity: string;
      accountSecurityContent: string;
      userConduct: string;
      userConductContent: string;
      userCondut1: string;
      userCondut2: string;
      userCondut3: string;
      userCondut4: string;
      userCondut5: string;
      termination: string;
      terminationContent: string;
      intellectualProperty: string;
      intellectualPropertyContent: string;
      communitcation: string;
      communitcationContent: string;
      contactInfo: string;
      contactInfoContent: string;
      email: string;
      phone: string;
      address: string;
    };
    privacyPolicy: {
      title: string;
      lastUpdated: string;
      description: string;
      informationCollection: string;
      informationCollectionContent: string;
      personalInformation: string;
      professionalInformation: string;
      accountCredentials: string;
      communicationPreferences: string;
      dataSecurity: string;
      dataSecurityContent: string;
      informationUsage: string;
      informationUsageContent: string;
      provideAndMaintainService: string;
      processTransaction: string;
      sendTechnicalNotice: string;
      communicateProduct: string;
      respondComment: string;
      userRights: string;
      userRightsContent: string;
      accessYourInformation: string;
      correctYourInformation: string;
      deleteYourInformation: string;
      objectDataProcessing: string;
      requestDataPortability: string;
      dataRetention: string;
      dataRetentionContent: string;
      updatesToPolicy: string;
      updatesToPolicyContent: string;
      contactInfo: string;
      contactInfoContent: string;
      email: string;
      phone: string;
      address: string;
    };
    register: {
      title: string;
      fullName: string;
      fullNamePlaceholder: string;
      invalidName: string;
      email: string;
      emailPlaceholder: string;
      invalidEmail: string;
      PhoneNumber: string;
      phoneNumberPlaceholder: string;
      invalidPhoneNumber: string;
      role: string;
      invalidRole: string;
      selectRole: string;
      worker: string;
      technician: string;
      entrepreneur: string;
      password: string;
      invalidPassword: string;
      confirmPassword: string;
      registerButton: string;
      alreadyHaveAccount: string;
      loginInstead: string;
      loginButton: string;
      passwordRequirement: string;
      req1: string;
      req2: string;
      req3: string;
      req4: string;
      req5: string;
      termsAndConditions: string;
    };
    login: {
      title: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      loginButton: string;
      noAccount: string;
      registerInstead: string;
      registerButton: string;
      invalidEmail: string;
      passwordRequired: string;
      signIn: string;
      signingIn: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      invalidEmail: string;
      email: string;
      emailPlaceholder: string;
      sendResetLink: string;
      sending: string;
      or: string;
      backToLogin: string;
      backToHome: string;
      success: string;
      resetLinkSent1: string;
      resetLinkSent2: string;
      goToHome: string;
      error: string;
      emailInvalid: string;
      emailRequired: string;
      emailNotFound: string;
      emailSent: string;
      emailSending: string;
      instruction: string;
      tryAnotherEmail: string;
      resetLinkTitle: string;
      requestAnotherLink: string;
      resetLinkSent: string;
      checkEmail: string;
    };
    adminLogin: {
      title: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      loginButton: string;
      invalidEmail: string;
      passwordRequired: string;
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
      logout: string;
      profile: string;
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
      description: string;
      company: string;
      rights: string;
      followUs: string;
      poweredBy: string;
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
      downloadApp: string;
      downloadIOS: string;
      downloadAndroid: string;
    };
    home: {
      trusted: string;
      title: string;
      subtitle: string;
      getStarted: string;
      learnMore: string;
      whyUs: string;
      whyUsDescription: string;
      conectExperts: string;
      conectExpertsDescription: string;
      findOpportunities: string;
      findOpportunitiesDescription: string;
      securePlatform: string;
      securePlatformDescription: string;
      solutionsForEveryNeeds: string;
      solutionsForEveryNeedsDescription: string;
      forFarmers: string;
      forFarmersDescription: string;
      farmerBenefits: string[];
      forTechnicians: string;
      forTechniciansDescription: string;
      forTechniciansBenefits: string[];
      forEntrepreneurs: string;
      forEntrepreneursDescription: string;
      forEntrepreneursBenefits: string[];
      getStartedButton: string;
      readyToGetStarted: string;
      joinOurNetwork: string;
      connect: string;
      login: string;
      contactUsButton: string;
      downloadAppTitle: string;
      downloadAppDescription: string;
    };
    about: {
      title: string;
      description: string;
      mission: string;
      missionDescription: string;
      ourValue: string;
      ourValueDescription: string;
      communityFirst: string;
      communityFirstDescription: string;
      innovationDriven: string;
      innovationDrivenDescription: string;
      sustainabilityFocused: string;
      sustainabilityFocusedDescription: string;
      excellence: string;
      excellenceDescription: string;
      ourJourney: string;
      ourJourneyDescription: string;
      ourTeam: string;
      ourTeamDescription: string;
      learnMore: string;
    };
    services: {
      agriculturalSolution: string;
      title: string;
      description: string;
      getStarted: string;
      contactSales: string;
      solutionsForEveryNeed: string;
      solutionsForEveryNeedDescription: string;
      service1: {
        name: string;
        description: string;
        features: string[];
      };
      service2: {
        name: string;
        description: string;
        features: string[];
      };
      service3: {
        name: string;
        description: string;
        features: string[];
      };
      service4: {
        name: string;
        description: string;
        features: string[];
      };
      service5: {
        name: string;
        description: string;
        features: string[];
      };
      service6: {
        name: string;
        description: string;
        features: string[];
      };
      whatOurUsersSay: string;
      whatOurUsersSayDescription: string;
      readyToGetStarted: string;
      joinOurNetwork: string;
      connect: string;
      createAccountButton: string;
      learnMoreButton: string;
      feature: string;
      contactUsButton: string;
    };
    serviceDetail: {
      serviceNotFound: {
        title: string;
        description: string;
        backToServices: string;
      };
      professionalService: string;
      getStarted: string;
      contactSales: string;
      keyBenefits: {
        title: string;
        heading: string;
        description: string;
      };
      useCases: {
        title: string;
        heading: string;
        description: string;
      };
      successStories: {
        title: string;
        heading: string;
        description: string;
      };
      pricingPlans: {
        title: string;
        heading: string;
        description: string;
        mostPopular: string;
        free: string;
        custom: string;
        perMonth: string;
        contactSales: string;
      };
      readyToGetStarted: {
        heading: string;
        description: string;
        startFreeTrial: string;
      };
      networkBuilding: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      knowledgeExchange: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      partnershipFacilitation: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      verifiedExpertise: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      marketInsights: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
      businessGrowth: {
        detailedDescription: string;
        benefits: string[];
        useCases: Array<{
          title: string;
          description: string;
        }>;
      };
    };
    contact: {
      tagline: string;
      title: string;
      description: string;
      form: {
        title: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        role: string;
        farmer: string;
        technician: string;
        entrepreneur: string;
        subject: string;
        subjectPlaceholder: string;
        message: string;
        messagePlaceholder: string;
        submit: string;
        submited: string;
        nameError: string;
        emailError: string;
        messageError: string;
        emailInvalid: string;
        messageLength: string;
        messageSent: string;
        messageSending: string;
        messageSendingError: string;
        messageSendingSuccess: string;
        success: string;
        error: string;
      };
      contactInfo: {
        title: string;
        description: string;
        visitUs: string;
        emailUs: string;
        callUs: string;
        businessHours: string;
        monday: string;
        friday: string;
        saturday: string;
        sunday: string;
        closed: string;
      };
    };
    faq: {
      tagline: string;
      title: string;
      description: string;
      searchPlaceholder: string;
      tags: string[];
      question1: {
        question: string;
        answer: string;
      };
      question2: {
        question: string;
        answer: string;
      };
      question3: {
        question: string;
        answer: string;
      };
      question4: {
        question: string;
        answer: string;
      };
      question5: {
        question: string;
        answer: string;
      };
      question6: {
        question: string;
        answer: string;
      };
      question7: {
        question: string;
        answer: string;
      };
      question8: {
        question: string;
        answer: string;
      };
      question9: {
        question: string;
        answer: string;
      };
      questionNotFound: string;
      stillHaveQuestions: string;
      cannotFind: string;
      contactSupportButton: string;
    };
    blog: {
      tagline: string;
      title: string;
      description: string;
      read: string;
      readMore: string;
      recentPosts: string;
      categories: string;
      searchPlaceholder: string;
      noResults: string;
      allCategories: string;
      technology: string;
      agriculture: string;
      innovation: string;
      sustainability: string;
      business: string;
      by: string;
    };
    // profile: {};
    termsOfService: {
      title: string;
      lastUpdated: string;
      description: string;
      agreementToTerms: string;
      agreementToTermsContent: string;
      accountSecurity: string;
      accountSecurityContent: string;
      userConduct: string;
      userConductContent: string;
      userCondut1: string;
      userCondut2: string;
      userCondut3: string;
      userCondut4: string;
      userCondut5: string;
      termination: string;
      terminationContent: string;
      intellectualProperty: string;
      intellectualPropertyContent: string;
      communitcation: string;
      communitcationContent: string;
      contactInfo: string;
      contactInfoContent: string;
      email: string;
      phone: string;
      address: string;
    };
    privacyPolicy: {
      title: string;
      lastUpdated: string;
      description: string;
      informationCollection: string;
      informationCollectionContent: string;
      personalInformation: string;
      professionalInformation: string;
      accountCredentials: string;
      communicationPreferences: string;
      dataSecurity: string;
      dataSecurityContent: string;
      informationUsage: string;
      informationUsageContent: string;
      provideAndMaintainService: string;
      processTransaction: string;
      sendTechnicalNotice: string;
      communicateProduct: string;
      respondComment: string;
      userRights: string;
      userRightsContent: string;
      accessYourInformation: string;
      correctYourInformation: string;
      deleteYourInformation: string;
      objectDataProcessing: string;
      requestDataPortability: string;
      dataRetention: string;
      dataRetentionContent: string;
      updatesToPolicy: string;
      updatesToPolicyContent: string;
      contactInfo: string;
      contactInfoContent: string;
      email: string;
      phone: string;
      address: string;
    };
    register: {
      title: string;
      fullName: string;
      fullNamePlaceholder: string;
      invalidName: string;
      email: string;
      emailPlaceholder: string;
      invalidEmail: string;
      PhoneNumber: string;
      phoneNumberPlaceholder: string;
      invalidPhoneNumber: string;
      role: string;
      invalidRole: string;
      selectRole: string;
      worker: string;
      technician: string;
      entrepreneur: string;
      password: string;
      invalidPassword: string;
      confirmPassword: string;
      registerButton: string;
      alreadyHaveAccount: string;
      loginInstead: string;
      loginButton: string;
      passwordRequirement: string;
      req1: string;
      req2: string;
      req3: string;
      req4: string;
      req5: string;
      termsAndConditions: string;
    };
    login: {
      title: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      loginButton: string;
      noAccount: string;
      registerInstead: string;
      registerButton: string;
      invalidEmail: string;
      passwordRequired: string;
      signIn: string;
      signingIn: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      invalidEmail: string;
      email: string;
      emailPlaceholder: string;
      sendResetLink: string;
      sending: string;
      or: string;
      backToLogin: string;
      backToHome: string;
      success: string;
      resetLinkSent1: string;
      resetLinkSent2: string;
      goToHome: string;
      error: string;
      emailInvalid: string;
      emailRequired: string;
      emailNotFound: string;
      emailSent: string;
      emailSending: string;
      instruction: string;
      tryAnotherEmail: string;
      resetLinkTitle: string;
      requestAnotherLink: string;
      resetLinkSent: string;
      checkEmail: string;
    };
    adminLogin: {
      title: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      loginButton: string;
      invalidEmail: string;
      passwordRequired: string;
    };
  };
}
