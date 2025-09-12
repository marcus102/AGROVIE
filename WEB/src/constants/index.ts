export type ThemeType = "light" | "dark";

export interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    muted: string;
  };
  statusBar: "light" | "dark";
}

export const lightTheme: Theme = {
  colors: {
    primary: "#166534",
    background: "#f9fafb",
    card: "#ffffff",
    text: "#111827",
    border: "#e5e7eb",
    notification: "#ef4444",
    success: "#059669",
    error: "#dc2626",
    warning: "#92400e",
    info: "#1d4ed8",
    muted: "#6b7280",
  },
  statusBar: "dark",
};

export const darkTheme: Theme = {
  colors: {
    primary: "#4ade80",
    background: "#111827",
    card: "#1f2937",
    text: "#f9fafb",
    border: "#374151",
    notification: "#f87171",
    success: "#34d399",
    error: "#ef4444",
    warning: "#fbbf24",
    info: "#60a5fa",
    muted: "#9ca3af",
  },
  statusBar: "light",
};

export const translations = {
  fr: {
    header: {
      home: "Accueil",
      about: "À propos",
      services: "Services",
      contact: "Contactez-nous",
      faq: "FAQ",
      blog: "Blog",
      register: "S'inscrire",
      login: "Connexion",
      logout: "Deconnexion",
      profile: "Profil",
    },
    resetPassword: {
      title: "Réinitialiser le mot de passe",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "Réinitialiser le mot de passe",
      requirements: "Exigences du mot de passe",
      success: "Mot de passe réinitialisé avec succès !",
      error: "Une erreur s'est produite. Veuillez réessayer.",
    },
    footer: {
      description:
        "Connecter les professionnels agricoles du monde entier grâce à une technologie innovante.",
      company: "Entreprise",
      rights: "Tous droits réservés",
      followUs: "Suivez-nous",
      poweredBy: "Propulsé par",
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
      legal: "Mentions légales",
      contact: "Contact",
      blog: "Blog",
      services: "Services",
      about: "À propos",
      faq: "FAQ",
      support: "Support",
      help: "Aide",
      supportEmail: "Email du support",
      supportPhone: "Téléphone du support",
      supportAddress: "Adresse du support",
      downloadApp: "Télécharger l'application",
      downloadIOS: "Disponible sur l'App Store",
      downloadAndroid: "Disponible sur Google Play",
    },
    home: {
      trusted: "Approuvé par les Professionnels de l'Agriculture",
      title: "Développez votre réseau agricole",
      subtitle:
        "Connectez-vous avec des professionnels agricoles, accédez à des connaissances expertes et découvrez des opportunités dans un réseau de confiance conçu pour l'avenir de l'agriculture.",
      getStarted: "Telecharger l'application mobile",
      learnMore: "En savoir plus",
      whyUs: "Pourquoi choisir Agrovie ?",
      whyUsDescription: "La plateforme conçue pour la réussite agricole",
      conectExperts: "Connectez-vous avec des experts",
      conectExpertsDescription:
        "Réseauz avec des professionnels agricoles vérifiés dans votre région",
      findOpportunities: "Trouvez des opportunités",
      findOpportunitiesDescription:
        "Découvrez des projets et missions correspondant à votre expertise",
      securePlatform: "Plateforme sécurisée",
      securePlatformDescription:
        "Opérez dans un environnement de confiance avec des membres vérifiés",
      solutionsForEveryNeeds: "Solutions pour chaque besoin",
      solutionsForEveryNeedsDescription:
        "Fonctionnalités adaptées aux différents professionnels agricoles",
      forFarmers: "Pour les agriculteurs",
      forFarmersDescription:
        "Accédez à des conseils d'experts et trouvez des conseilés agricole qualifiés",
      farmerBenefits: [
        "Consultation d'experts",
        "Accès à l'équipement",
        "Informations sur le marché",
      ],
      forTechnicians: "Pour les conseilés agricole",
      forTechniciansDescription:
        "Connectez-vous avec des agriculteurs et mettez en valeur votre expertise",
      forTechniciansBenefits: [
        "Appariement de projets",
        "Réseau professionnel",
        "Validation des compétences",
      ],
      forEntrepreneurs: "Pour les entrepreneurs",
      forEntrepreneursDescription:
        "Découvrez des opportunités et développez votre entreprise agricole",
      forEntrepreneursBenefits: [
        "Opportunités d'investissement",
        "Analyse de marché",
        "Outils commerciaux",
      ],
      getStartedButton: "Commencer",
      readyToGetStarted: "Prêt à commencer ?",
      joinOurNetwork:
        "Rejoignez notre réseau en pleine croissance aujourd'hui.",
      connect:
        "Connectez-vous avec des professionnels agricoles et développez votre activité.",
      login: "Connexion",
      contactUsButton: "Contactez-nous",
      downloadAppTitle: "Téléchargez notre application",
      downloadAppDescription:
        "Pour commencer, veuillez télécharger notre application mobile depuis votre magasin préféré. Ou directement depuis notre site web.",
    },
    about: {
      title: "Notre histoire",
      description:
        "Construire l'avenir de l'agriculture grâce à la technologie et la collaboration",
      mission: "Notre mission",
      missionDescription:
        "Nous avons pour mission d'autonomiser les professionnels agricoles grâce à la technologie et à la collaboration. En connectant experts, innovateurs et producteurs, nous construisons un avenir plus durable et efficace pour l'agriculture.",
      ourValue: "Nos valeurs",
      ourValueDescription:
        "Guidés par des principes qui promeuvent une agriculture durable et la croissance communautaire",
      communityFirst: "Communauté d'abord",
      communityFirstDescription:
        "Construire des liens solides entre professionnels agricoles",
      innovationDriven: "Axé sur l'innovation",
      innovationDrivenDescription:
        "Favoriser le progrès agricole grâce à la technologie",
      sustainabilityFocused: "Croissance durable",
      sustainabilityFocusedDescription:
        "Promouvoir des pratiques agricoles respectueuses de l'environnement",
      excellence: "Excellence",
      excellenceDescription:
        "Maintenir les normes les plus élevées en matière de réseautage agricole",
      ourJourney: "Notre parcours",
      ourJourneyDescription: "Étapes clés de notre histoire",
      ourTeam: "Notre équipe",
      ourTeamDescription: "Rencontrez les experts derrière Agrovie",
      learnMore: "En savoir plus",
    },
    services: {
      agriculturalSolution: "Solutions Agricoles Comprehensives",
      title: "Nos services",
      description:
        "Solutions complètes conçues pour soutenir et améliorer votre entreprise agricole.",
      getStarted: "Commencer",
      contactSales: "Contacter les ventes",
      solutionsForEveryNeed: "Solutions pour chaque besoin",
      solutionsForEveryNeedDescription:
        "Découvrez notre gamme complète de services agricoles",
      service1: {
        name: "Construction de réseau",
        description:
          "Connectez-vous avec des agriculteurs, agronomes et entrepreneurs agricoles du monde entier.",
        features: [
          "Opportunités de réseautage mondial",
          "Connexions spécifiques à l'industrie",
          "Création de profil professionnel",
        ],
      },
      service2: {
        name: "Échange de connaissances",
        description:
          "Partagez et acquérez des informations précieuses auprès d'experts agricoles.",
        features: [
          "Consultations d'experts",
          "Partage de bonnes pratiques",
          "Accès à la bibliothèque de ressources",
          "Ateliers en ligne",
        ],
      },
      service3: {
        name: "Facilitation de partenariats",
        description:
          "Trouvez et connectez-vous avec des partenaires commerciaux potentiels.",
        features: [
          "Système d'appariement de partenaires",
          "Opportunités de collaboration",
          "Réseautage commercial",
          "Facilitation de coentreprises",
        ],
      },
      service4: {
        name: "Expertise vérifiée",
        description:
          "Accédez à un réseau de professionnels agricoles vérifiés.",
        features: [
          "Vérification professionnelle",
          "Recommandations de compétences",
          "Validation des diplômes",
          "Système de notation de confiance",
        ],
      },
      service5: {
        name: "Informations sur le marché",
        description:
          "Restez informé des dernières tendances et données du marché agricole.",
        features: [
          "Rapports d'analyse de marché",
          "Outils de suivi des prix",
          "Prévisions de demande",
          "Tendances sectorielles",
        ],
      },
      service6: {
        name: "Croissance commerciale",
        description:
          "Accédez à des outils et ressources pour la croissance et l'expansion de votre entreprise.",
        features: [
          "Outils de planification commerciale",
          "Développement de stratégie de croissance",
          "Opportunités de financement",
          "Suivi de la réussite",
        ],
      },
      whatOurUsersSay: "Ce que disent nos utilisateurs",
      whatOurUsersSayDescription:
        "Témoignages de professionnels agricoles qui ont transformé leurs opérations",
      readyToGetStarted: "Prêt à commencer ?",
      joinOurNetwork:
        "Rejoignez notre réseau en pleine croissance aujourd'hui.",
      connect:
        "Connectez-vous avec des professionnels agricoles et développez votre activité.",
      createAccountButton: "Créer un compte",
      learnMoreButton: "En savoir plus",
      feature: "Fonctionnalité(s)",
      contactUsButton: "Contactez-nous",
    },
    serviceDetail: {
      serviceNotFound: {
        title: "Service non trouvé",
        description: "Le service que vous recherchez n'existe pas.",
        backToServices: "Retour aux services",
      },
      professionalService: "Service Professionnel",
      getStarted: "Commencer",
      contactSales: "Contacter les ventes",
      keyBenefits: {
        title: "Avantages clés",
        heading: "Pourquoi choisir ce service ?",
        description:
          "Découvrez les avantages puissants qui font de notre service le choix préféré des professionnels de l'agriculture dans le monde entier.",
      },
      useCases: {
        title: "Cas d'utilisation",
        heading: "Applications réelles",
        description:
          "Découvrez comment les professionnels de l'agriculture utilisent notre service pour résoudre des défis concrets et atteindre leurs objectifs.",
      },
      successStories: {
        title: "Témoignages",
        heading: "Ce que disent nos clients",
        description:
          "Écoutez les professionnels de l'agriculture qui ont transformé leurs opérations avec notre service.",
      },
      pricingPlans: {
        title: "Plans tarifaires",
        heading: "Choisissez votre plan",
        description:
          "Options tarifaires flexibles conçues pour évoluer avec votre entreprise agricole.",
        mostPopular: "Le plus populaire",
        free: "Gratuit",
        custom: "Personnalisé",
        perMonth: "/mois",
        contactSales: "Contacter les ventes",
      },
      readyToGetStarted: {
        heading: "Prêt à commencer ?",
        description:
          "Rejoignez des milliers de professionnels de l'agriculture qui bénéficient déjà de notre service {serviceName}.",
        startFreeTrial: "Commencer l'essai gratuit",
      },
      networkBuilding: {
        detailedDescription:
          "Notre service de construction de réseau connecte les professionnels de l'agriculture du monde entier, créant un écosystème complet où agriculteurs, conseilés agricole et entrepreneurs peuvent collaborer, partager des connaissances et grandir ensemble. Grâce à nos algorithmes de correspondance avancés et à nos profils professionnels vérifiés, nous assurons des connexions significatives qui génèrent des résultats commerciaux réels.",
        benefits: [
          "Accès à plus de 10 000 professionnels de l'agriculture vérifiés",
          "Système de vérification de profil professionnel",
          "Support multilingue pour des connexions mondiales",
        ],
        useCases: [
          {
            title: "Partage d'équipement agricole",
            description:
              "Connectez-vous avec des agriculteurs à proximité pour partager du matériel coûteux et réduire les coûts opérationnels.",
          },
          {
            title: "Consultation d'expert",
            description:
              "Trouvez et consultez des experts agricoles pour des défis spécifiques liés aux cultures ou au bétail.",
          },
          {
            title: "Partenariats dans la chaîne d'approvisionnement",
            description:
              "Établissez des relations avec des fournisseurs et des distributeurs pour optimiser votre chaîne d'approvisionnement.",
          },
        ],
      },
      knowledgeExchange: {
        detailedDescription:
          "Notre plateforme d'échange de connaissances révolutionne la façon dont les connaissances agricoles sont partagées et accessibles. De la recherche de pointe aux pratiques agricoles éprouvées, notre plateforme garantit que des informations précieuses atteignent ceux qui en ont le plus besoin, quand ils en ont besoin.",
        benefits: [
          "Accès à plus de 5 000 articles de recherche et études de cas",
          "Consultations d'experts en direct et sessions de questions-réponses",
          "Ateliers interactifs et modules de formation",
          "Communauté de partage des meilleures pratiques",
          "Bibliothèque de contenu multilingue",
          "Expérience d'apprentissage mobile-first",
        ],
        useCases: [
          {
            title: "Diagnostic des maladies des cultures",
            description:
              "Accédez instantanément à des outils d'identification des maladies et à des recommandations de traitement.",
          },
          {
            title: "Pratiques agricoles durables",
            description:
              "Apprenez des méthodes agricoles respectueuses de l'environnement qui améliorent le rendement et réduisent l'impact environnemental.",
          },
          {
            title: "Analyse des tendances du marché",
            description:
              "Restez informé des dernières tendances du marché et des informations sur les prix.",
          },
        ],
      },
      partnershipFacilitation: {
        detailedDescription:
          "Notre service de facilitation de partenariats sert de pont entre les parties prenantes agricoles, créant des alliances stratégiques qui stimulent l'innovation et la croissance. Nous utilisons des algorithmes de correspondance avancés et l'expertise humaine pour identifier et faciliter des partenariats qui créent une valeur mutuelle.",
        benefits: [
          "Système de correspondance de partenaires alimenté par l'IA",
          "Services de soutien juridique et contractuel",
          "Assistance en due diligence",
          "Suivi de la réussite des partenariats",
          "Soutien à la résolution des conflits",
          "Opportunités de partenariats internationaux",
        ],
        useCases: [
          {
            title: "Intégration technologique",
            description:
              "Partenaires avec des entreprises technologiques pour mettre en œuvre des solutions d'agriculture intelligente.",
          },
          {
            title: "Expansion du marché",
            description:
              "Trouvez des partenaires de distribution pour vous développer sur de nouveaux marchés géographiques.",
          },
          {
            title: "Collaboration de recherche",
            description:
              "Collaborez avec des institutions de recherche sur des projets agricoles innovants.",
          },
        ],
      },
      verifiedExpertise: {
        detailedDescription:
          "Notre service d'expertise vérifiée garantit que vous vous connectez avec des professionnels agricoles authentiques et qualifiés. Grâce à notre processus de vérification rigoureux, nous validons les références, l'expérience et l'expertise pour instaurer la confiance dans notre communauté.",
        benefits: [
          "Processus de vérification à plusieurs niveaux",
          "Validation des diplômes et certifications",
          "Vérification de l'expérience par des références",
          "Suivi continu des performances",
          "Système de notation de confiance",
          "Couverture d'assurance et de responsabilité",
        ],
        useCases: [
          {
            title: "Embauche d'experts",
            description:
              "Embauchez des consultants agricoles vérifiés en toute confiance dans leurs qualifications.",
          },
          {
            title: "Validation des compétences",
            description:
              "Validez vos propres compétences et soyez reconnu comme un expert vérifié.",
          },
          {
            title: "Assurance qualité",
            description:
              "Assurez-vous que tous les partenariats sont conclus avec des professionnels vérifiés et dignes de confiance.",
          },
        ],
      },
      marketInsights: {
        detailedDescription:
          "Notre service Market Insights fournit des données, des tendances et des analyses du marché agricole en temps réel pour vous aider à prendre des décisions commerciales éclairées. Des prix des matières premières aux modèles météorologiques, nous agrégeons des données provenant de multiples sources pour vous donner un avantage concurrentiel.",
        benefits: [
          "Suivi des prix des matières premières en temps réel",
          "Intégration des données météorologiques et climatiques",
          "Analyse des tendances du marché et prévisions",
          "Analyse de l'offre et de la demande",
          "Alertes et notifications personnalisées",
          "Données historiques et analyse des tendances",
        ],
        useCases: [
          {
            title: "Optimisation des prix",
            description:
              "Optimisez les prix de vente en fonction des données et tendances du marché en temps réel.",
          },
          {
            title: "Planification des cultures",
            description:
              "Planifiez la sélection des cultures en fonction des prévisions de demande du marché.",
          },
          {
            title: "Gestion des risques",
            description:
              "Identifiez et atténuez les risques du marché grâce à des informations basées sur les données.",
          },
        ],
      },
      businessGrowth: {
        detailedDescription:
          "Notre service Business Growth fournit des outils et des ressources complets pour aider les entreprises agricoles à se développer et à réussir. De la planification commerciale aux opportunités de financement, nous soutenons votre parcours de croissance à chaque étape.",
        benefits: [
          "Modèles et outils de planification d'entreprise",
          "Correspondance d'opportunités de financement",
          "Consultation en stratégie de croissance",
          "Suivi des performances et analyses",
          "Programmes de mentorat",
          "Soutien à l'expansion du marché",
        ],
        useCases: [
          {
            title: "Lancement de startup",
            description:
              "Bénéficiez d'un soutien complet pour lancer votre startup agricole avec succès.",
          },
          {
            title: "Mise à l'échelle des opérations",
            description:
              "Accédez à des outils et des ressources pour développer votre entreprise agricole existante.",
          },
          {
            title: "Acquisition de financement",
            description:
              "Connectez-vous avec des investisseurs et des opportunités de financement adaptées à l'agriculture.",
          },
        ],
      },
    },
    contact: {
      tagline: "Nous sommes là pour vous aider",
      title: "Contactez-nous",
      description:
        "Vous avez des questions sur notre plateforme ? Nous sommes là pour vous aider à vous connecter avec la communauté agricole.",
      form: {
        title: "Envoyez-nous un message",
        name: "Nom",
        namePlaceholder: "Entrez votre nom",
        email: "Adresse email",
        emailPlaceholder: "Entrez votre adresse email",
        role: "Je suis un",
        farmer: "Agriculteur",
        technician: "Technicien",
        entrepreneur: "Entrepreneur",
        subject: "Sujet",
        subjectPlaceholder: "Entrez le sujet",
        message: "Message",
        messagePlaceholder: "Entrez votre message",
        submit: "Envoyer le message",
        submited: " Message envoyé!",
        nameError: "Le nom est requis",
        emailError: "Une adresse email valide est requise",
        messageError: "Le message est requis",
        emailInvalid: "Adresse email invalide",
        messageLength: "Le message doit contenir au moins 10 caractères",
        messageSent: "Message envoyé avec succès !",
        messageSending: "Envoi du message...",
        messageSendingError:
          "Erreur lors de l'envoi du message. Veuillez réessayer.",
        messageSendingSuccess: "Votre message a été envoyé avec succès !",
        success: "Votre message a été envoyé avec succès !",
        error: "Une erreur s'est produite. Veuillez réessayer.",
      },
      contactInfo: {
        title: "Informations de contact",
        description:
          "Nous sommes là pour vous aider. Contactez-nous par les moyens suivants :",
        visitUs: "Visitez-nous",
        emailUs: "Envoyez-nous un email",
        callUs: "Appelez-nous",
        businessHours: "Heures d'ouverture",
        monday: "Lundi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche",
        closed: "Fermé",
      },
    },
    faq: {
      tagline: "Ayez des reponses à vos questions",
      title: "Foire aux questions",
      description:
        "Trouvez des réponses aux questions courantes sur Agro et comment il peut vous aider à réussir dans l'agriculture.",
      searchPlaceholder: "Rechercher des questions...",
      tags: [
        "Toutes les questions",
        "Général",
        "Pour agriculteurs",
        "Pour conseillers agricoles",
        "Pour entrepreneurs",
      ],
      question1: {
        question: "Qu'est-ce qu'Agrovie ?",
        answer:
          "Agrovie est une plateforme de réseautage professionnel conçue spécifiquement pour l'industrie agricole. Nous connectons agriculteurs, techniciens agricoles et entrepreneurs pour faciliter la collaboration, le partage de connaissances et la croissance commerciale.",
      },
      question2: {
        question:
          "Comment les agriculteurs peuvent-ils bénéficier de la plateforme ?",
        answer:
          "Les agriculteurs peuvent se connecter avec des experts agricoles, accéder à des techniques agricoles modernes, trouver des fournisseurs d'équipements et partager des expériences avec d'autres agriculteurs. La plateforme fournit également des informations sur le marché et des mises à jour météorologiques.",
      },
      question3: {
        question:
          "Quelles opportunités existent pour les conseillers agricoles ?",
        answer:
          "Les conseillers agricoles peuvent proposer leurs services, partager leur expertise, se connecter avec des agriculteurs ayant besoin d'un support technique et se tenir informés des dernières technologies et méthodologies agricoles.",
      },
      question4: {
        question: "Comment Agrovie soutient-il les agro-entrepreneurs ?",
        answer:
          "Les entrepreneurs peuvent découvrir des opportunités commerciales, se connecter avec des partenaires potentiels, accéder à des données de marché et trouver des opportunités d'investissement dans le secteur agricole.",
      },
      question5: {
        question: "La plateforme est-elle gratuite ?",
        answer:
          "Nous proposons des abonnements gratuits et premium. La version gratuite offre des fonctionnalités de base de réseautage, tandis que les membres premium ont accès à des outils avancés, des analyses détaillées et un support prioritaire.",
      },
      question6: {
        question: "Puis-je vendre mes produits directement sur la plateforme ?",
        answer:
          "Oui, les agriculteurs vérifiés peuvent lister leurs produits sur notre marketplace, se connectant directement avec acheteurs et distributeurs.",
      },
      question7: {
        question:
          "Comment les prestataires de services techniques sont-ils vérifiés ?",
        answer:
          "Nous vérifions les prestataires de services techniques par un processus complet incluant la vérification des diplômes, la validation de l'expérience et des évaluations par les pairs.",
      },
      question8: {
        question: "Quels types de données de marché sont disponibles ?",
        answer:
          "Les membres premium ont accès aux prix du marché en temps réel, aux prévisions de demande, aux tendances agricoles régionales et aux analyses d'opportunités d'investissement.",
      },
      question9: {
        question: "Comment puis-je contacter le support client ?",
        answer:
          "Le support client est disponible par email, téléphone ou chat en direct.",
      },
      questionNotFound:
        "Aucune question trouvée correspondant à votre recherche.",
      stillHaveQuestions: "Vous avez encore des questions ?",
      cannotFind:
        "Vous ne trouvez pas ce que vous cherchez ? Notre équipe de support est là pour vous aider.",
      contactSupportButton: "Contacter le support",
    },
    blog: {
      tagline: "Dernières Perspectives Agricoles",
      title: "Actualités et tendances agricoles",
      description:
        "Restez informé des dernières nouvelles, tendances et analyses dans le domaine de l'agriculture et de la technologie.",
      read: "de lecture",
      readMore: "Lire la suite",
      recentPosts: "Articles récents",
      categories: "Catégories",
      searchPlaceholder: "Rechercher des articles...",
      noResults: "Aucun article trouvé",
      allCategories: "Toutes les catégories",
      technology: "Technologie",
      agriculture: "Agriculture",
      innovation: "Innovation",
      sustainability: "Durabilité",
      business: "Affaires",
      by: "Par",
    },
    termsOfService: {
      title: "Conditions d'utilisation",
      lastUpdated: "Dernière mise à jour",
      description:
        "Veuillez lire attentivement ces Conditions d'utilisation avant d'utiliser la plateforme et les services d'Agrovie.",
      agreementToTerms: "Acceptation des conditions",
      agreementToTermsContent:
        "En accédant ou utilisant les services d'Agrovie, vous acceptez d'être lié par ces Conditions d'utilisation et toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions, vous êtes interdit d'utiliser nos services.",
      accountSecurity: "Sécurité du compte",
      accountSecurityContent:
        "Vous êtes responsable de la confidentialité de votre compte et mot de passe. Vous acceptez d'assumer la responsabilité de toutes les activités survenant sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée.",
      userConduct: "Comportement de l'utilisateur",
      userConductContent: "Vous vous engagez à ne pas :",
      userCondut1: "Publier ou transmettre du contenu nuisible ou malveillant",
      userCondut2: "Usurper l'identité d'une personne ou entité",
      userCondut3: "Interférer ou perturber nos services",
      userCondut4: "Collecter des informations utilisateurs sans consentement",
      userCondut5: "Utiliser nos services à des fins illégales",
      termination: "Résiliation",
      terminationContent:
        "Nous nous réservons le droit de résilier ou suspendre votre compte et accès à nos services immédiatement, sans préavis, pour toute raison incluant le non-respect de ces Conditions.",
      intellectualProperty: "Propriété intellectuelle",
      intellectualPropertyContent:
        "Le service et son contenu original sont la propriété d'Agrovie, protégés par les lois internationales sur le droit d'auteur, les marques commerciales, brevets et secrets commerciaux.",
      communitcation: "Communication",
      communitcationContent:
        "En créant un compte, vous acceptez de recevoir nos communications incluant newsletters et promotions. Vous pouvez vous désinscrire des communications marketing à tout moment.",
      contactInfo: "Contact et informations",
      contactInfoContent:
        "Pour toute question concernant ces Conditions d'utilisation, contactez-nous à :",
      email: "Email : support@agrovie.africa",
      phone: "Téléphone : +22674189763",
      address: "Adresse : Ouagadougou, Burkina Faso",
    },
    privacyPolicy: {
      title: "Politique de confidentialité",
      lastUpdated: "Dernière mise à jour",
      description:
        "Agrovie prend votre vie privée au sérieux. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles.",
      informationCollection: "Collecte d'informations",
      informationCollectionContent:
        "Nous collectons les informations que vous nous fournissez directement, incluant :",
      personalInformation: "Informations personnelles (nom, email, téléphone)",
      professionalInformation:
        "Informations professionnelles (métier, entreprise)",
      accountCredentials: "Identifiants de compte",
      communicationPreferences: "Préférences de communication",
      dataSecurity: "Sécurité des données",
      dataSecurityContent:
        "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre la destruction, perte, altération ou accès non autorisé.",
      informationUsage: "Utilisation des informations",
      informationUsageContent: "Vos informations servent à :",
      provideAndMaintainService: "Fournir et maintenir nos services",
      processTransaction: "Traiter vos transactions",
      sendTechnicalNotice: "Vous envoyer des notifications techniques",
      communicateProduct: "Vous communiquer sur produits/services/événements",
      respondComment: "Répondre à vos commentaires/questions",
      userRights: "Droits des utilisateurs",
      userRightsContent: "Vous avez le droit de :",
      accessYourInformation: "Accéder à vos informations",
      correctYourInformation: "Corriger vos informations",
      deleteYourInformation: "Supprimer vos informations",
      objectDataProcessing: "Vous opposer au traitement des données",
      requestDataPortability: "Demander la portabilité des données",
      dataRetention: "Conservation des données",
      dataRetentionContent:
        "Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos services. Vous pouvez demander leur suppression à tout moment.",
      updatesToPolicy: "Mises à jour de la politique",
      updatesToPolicyContent:
        "Nous pouvons mettre à jour cette politique occasionnellement. Nous vous informerons des changements en publiant la nouvelle version ici avec sa date de prise d'effet.",
      contactInfo: "Contact et informations",
      contactInfoContent:
        "Pour toute question concernant cette Politique de confidentialité, contactez-nous à :",
      email: "Email : support@agrovie.africa",
      phone: "Téléphone : +22674189763",
      address: "Adresse : Ouagadougou, Burkina Faso",
    },
    register: {
      title: "Créer un compte",
      fullName: "Nom complet",
      fullNamePlaceholder: "Entrez votre nom complet",
      invalidName: "Le nom doit contenir au moins 2 caractères",
      email: "Adresse email",
      emailPlaceholder: "Entrez votre adresse email",
      invalidEmail: "Adresse email invalide",
      PhoneNumber: "Numéro de téléphone",
      phoneNumberPlaceholder: "Entrez votre numéro de téléphone",
      invalidPhoneNumber: "Numéro de téléphone invalide",
      role: "Rôle",
      invalidRole:
        "Valeur d'énumération invalide. Attendue 'Worker' | 'Technician' | 'Entrepreneur', reçue ''",
      selectRole: "Sélectionnez un rôle",
      worker: "Ouvrier",
      technician: "Technicien",
      entrepreneur: "Entrepreneur",
      password: "Mot de passe",
      invalidPassword: "Le mot de passe doit contenir au moins 8 caractères",
      confirmPassword: "Confirmez le mot de passe",
      registerButton: "Créer un compte",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      loginInstead: "Se connecter",
      loginButton: "Se connecter",
      passwordRequirement: "Exigences du mot de passe",
      req1: "Au moins 8 caractères",
      req2: "Au moins 1 lettre majuscule",
      req3: "Au moins 1 lettre minuscule",
      req4: "Au moins 1 chiffre",
      req5: "Au moins 1 caractère spécial",
      termsAndConditions:
        "En créant un compte, vous acceptez nos Conditions Générales d'Utilisation.",
    },
    login: {
      title: "Connectez-vous à votre compte",
      email: "Adresse email",
      emailPlaceholder: "Entrez votre adresse email",
      password: "Mot de passe",
      passwordPlaceholder: "........",
      forgotPassword: "Mot de passe oublié ?",
      loginButton: "Se connecter",
      noAccount: "Vous n'avez pas de compte ?",
      registerInstead: "Créer un compte",
      registerButton: "S'inscrire",
      invalidEmail: "Adresse email invalide",
      passwordRequired: "Le mot de passe est requis",
      signIn: "Se connecter",
      signingIn: "Connexion en cours...",
    },
    forgotPassword: {
      title: "Réinitialiser votre mot de passe",
      description:
        "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
      invalidEmail: "Entrez une adresse email valide",
      email: "Adresse email",
      emailPlaceholder: "Entrez votre adresse email",
      sendResetLink: "Envoyer le lien de réinitialisation",
      sending: "Envoi du lien de réinitialisation...",

      or: "Ou",
      backToLogin: "Retour à la connexion",
      backToHome: "Retour à l'accueil",
      success: "Succès !",
      resetLinkSent1:
        "Nous avons envoyé un lien de réinitialisation de mot de passe à",
      resetLinkSent2:
        "Veuillez vérifier votre email et suivre les instructions pour réinitialiser votre mot de passe.",
      goToHome: "Retour à l'accueil",
      error: "Une erreur est survenue. Veuillez réessayer.",
      emailInvalid: "Adresse email invalide",
      emailRequired: "L'adresse email est requise",
      emailNotFound: "Adresse email non trouvée",
      emailSent: "Email envoyé avec succès !",
      emailSending: "Envoi de l'email en cours...",
      instruction:
        "Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe. Si vous ne voyez pas l'email, vérifiez votre dossier spam.",
      tryAnotherEmail: "Essayer une autre adresse email",
      resetLinkTitle: "Succès !",
      requestAnotherLink: "Demander un autre lien de réinitialisation",
      resetLinkSent: "Lien de réinitialisation envoyé avec успех!",
      checkEmail:
        "Vérifiez votre email pour le lien de réinitialisation. Si vous ne le trouvez pas, essayez de vérifier votre dossier spam.",
    },
    adminLogin: {
      title: "Connexion Administrateur",
      email: "Adresse email",
      emailPlaceholder: "Entrez votre adresse email",
      password: "Mot de passe",
      passwordPlaceholder: "........",
      loginButton: "Se connecter",
      invalidEmail: "Adresse email invalide",
      passwordRequired: "Le mot de passe est requis",
    },
  },

  //Agro
  en: {
    header: {
      home: "Home",
      about: "About",
      services: "Services",
      contact: "Contact Us",
      faq: "FAQ",
      blog: "Blog",
      register: "Register",
      login: "Login",
      logout: "Logout",
      profile: "Profile",
    },
    footer: {
      description:
        "Connecting agricultural professionals worldwide through innovative technology.",
      company: "Company",
      rights: "All rights reserved",
      followUs: "Follow us",
      poweredBy: "Powered by",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      legal: "Legal",
      contact: "Contact",
      blog: "Blog",
      services: "Services",
      about: "About",
      faq: "FAQ",
      support: "Support",
      help: "Help",
      supportEmail: "Support Email",
      supportPhone: "Support Phone",
      supportAddress: "Support Address",
      downloadApp: "Download the App",
      downloadIOS: "Download on the App Store",
      downloadAndroid: "Get it on Google Play",
    },
    home: {
      trusted: "Trusted by Agricultural Professionals",
      title: "Grow Your Agricultural Network",
      subtitle:
        "Connect with agricultural professionals, access expert knowledge, and discover opportunities in a trusted network designed for the future of farming.",
      getStarted: "Download the mobile app",
      learnMore: "Learn More",
      whyUs: "Why Choose Agrovie?",
      whyUsDescription: "The platform built for agricultural success",
      conectExperts: "Connect with Experts",
      conectExpertsDescription:
        "Network with verified agricultural professionals in your region",
      findOpportunities: "Find Opportunities",
      findOpportunitiesDescription:
        "Discover projects and missions that match your expertise",
      securePlatform: "Secure Platform",
      securePlatformDescription:
        "Operate in a trusted environment with verified members",
      solutionsForEveryNeeds: "Solutions for Every Need",
      solutionsForEveryNeedsDescription:
        "Tailored features for different agricultural professionals",
      forFarmers: "For Farmers",
      forFarmersDescription:
        "Access expert advice and find qualified agricultural advisors",
      farmerBenefits: [
        "Expert Consultation",
        "Equipment Access",
        "Market Insights",
      ],
      forTechnicians: "For agricultural advisors",
      forTechniciansDescription:
        "Connect with farmers and showcase your expertise",
      forTechniciansBenefits: [
        "Project Matching",
        "Professional Network",
        "Skill Validation",
      ],
      forEntrepreneurs: "For Entrepreneurs",
      forEntrepreneursDescription:
        "Discover opportunities and grow your agribusiness",
      forEntrepreneursBenefits: [
        "Investment Opportunities",
        "Market Analysis",
        "Business Tools",
      ],
      getStartedButton: "Get Started",
      readyToGetStarted: "Ready to Get Started?",
      joinOurNetwork: "Join our growing network today.",
      connect:
        "Connect with agricultural professionals and grow your business.",
      login: "Login",
      contactUsButton: "Contact Us",
      downloadAppTitle: "Download Our App",
      downloadAppDescription:
        "To get started, please download our mobile app from your preferred store. or directly from our website.",
    },
    about: {
      title: "Our Story",
      description:
        "Building the future of agriculture through technology and collaboration",
      mission: "Our Mission",
      missionDescription:
        "We're on a mission to empower agricultural professionals through technology and collaboration. By connecting experts, innovators, and producers, we're building a more sustainable and efficient future for farming.",
      ourValue: "Our Values",
      ourValueDescription:
        "Guided by principles that promote sustainable agriculture and community growth",
      communityFirst: "Community First",
      communityFirstDescription:
        "Building strong connections between agricultural professionals",
      innovationDriven: "Innovation Focus",
      innovationDrivenDescription:
        "Driving agricultural advancement through technology",
      sustainabilityFocused: "Sustainability Growth",
      sustainabilityFocusedDescription:
        "Promoting environmentally conscious farming practices",
      excellence: "Excellence",
      excellenceDescription:
        "Maintaining the highest standards in agricultural networking",
      ourJourney: "Our Journey",
      ourJourneyDescription: "Key milestones in our growth story",
      ourTeam: "Our Team",
      ourTeamDescription: "Meet the experts behind Agrovie",
      learnMore: "Learn More",
    },
    services: {
      agriculturalSolution: "Comprehensive Agricultural Solutions",
      title: "Our Services",
      description:
        "Comprehensive solutions designed to support and enhance your agricultural business.",
      getStarted: "Get Started",
      contactSales: "Contact Sales",
      solutionsForEveryNeed: "Solutions for Every Need",
      solutionsForEveryNeedDescription:
        "Discover our comprehensive range of agricultural services",
      service1: {
        name: "Network Building",
        description:
          "Connect with farmers, agronomists, and agricultural entrepreneurs worldwide.",
        features: [
          "Global networking opportunities",
          "Industry-specific connections",
          "Professional profile building",
        ],
      },
      service2: {
        name: "Knowledge Exchange",
        description:
          "Share and gain valuable insights from agricultural experts.",
        features: [
          "Expert consultations",
          "Best practice sharing",
          "Resource library access",
          "Online workshops",
        ],
      },
      service3: {
        name: "Partnership Facilitation",
        description:
          "Find and connect with potential business partners and collaborators.",
        features: [
          "Partner matching system",
          "Collaboration opportunities",
          "Business networking",
          "Joint venture facilitation",
        ],
      },
      service4: {
        name: "Verified Expertise",
        description: "Access a network of verified agricultural professionals.",
        features: [
          "Professional verification",
          "Skill endorsements",
          "Credential validation",
          "Trust scoring system",
        ],
      },
      service5: {
        name: "Market Insights",
        description:
          "Stay informed with the latest agricultural market trends and data.",
        features: [
          "Market analysis reports",
          "Price tracking tools",
          "Demand forecasting",
          "Industry trends",
        ],
      },
      service6: {
        name: "Business Growth",
        description:
          "Access tools and resources for business growth and expansion.",
        features: [
          "Business planning tools",
          "Growth strategy development",
          "Funding opportunities",
          "Success tracking",
        ],
      },
      whatOurUsersSay: "What Our Users Say",
      whatOurUsersSayDescription:
        "Hear from agricultural professionals who have transformed their operations",
      readyToGetStarted: "Ready to Get Started?",
      joinOurNetwork: "Join our growing network today.",
      connect:
        "Connect with agricultural professionals and grow your business.",
      createAccountButton: "Create Account",
      learnMoreButton: "Learn More",
      feature: "Feature(s)",
      contactUsButton: "Contact Us",
    },
    serviceDetail: {
      serviceNotFound: {
        title: "Service not found",
        description: "The service you're looking for doesn't exist.",
        backToServices: "Back to Services",
      },
      professionalService: "Professional Service",
      getStarted: "Get Started",
      contactSales: "Contact Sales",
      keyBenefits: {
        title: "Key Benefits",
        heading: "Why Choose This Service?",
        description:
          "Discover the powerful benefits that make our service the preferred choice for agricultural professionals worldwide.",
      },
      useCases: {
        title: "Use Cases",
        heading: "Real-World Applications",
        description:
          "See how agricultural professionals are using our service to solve real challenges and achieve their goals.",
      },
      successStories: {
        title: "Success Stories",
        heading: "What Our Clients Say",
        description:
          "Hear from agricultural professionals who have transformed their operations with our service.",
      },
      pricingPlans: {
        title: "Pricing Plans",
        heading: "Choose Your Plan",
        description:
          "Flexible pricing options designed to grow with your agricultural business.",
        mostPopular: "Most Popular",
        free: "Free",
        custom: "Custom",
        perMonth: "/month",
        contactSales: "Contact Sales",
      },
      readyToGetStarted: {
        heading: "Ready to Get Started?",
        description:
          "Join thousands of agricultural professionals who are already benefiting from our {serviceName} service.",
        startFreeTrial: "Start Free Trial",
      },
      networkBuilding: {
        detailedDescription:
          "Our Network Building service connects agricultural professionals worldwide, creating a comprehensive ecosystem where farmers, agricultural advisors, and entrepreneurs can collaborate, share knowledge, and grow together. Through our advanced matching algorithms and verified professional profiles, we ensure meaningful connections that drive real business results.",
        benefits: [
          "Access to verified agricultural professionals",
          "Professional profile verification system",
          "Multilingual support for global connections",
        ],
        useCases: [
          {
            title: "Farm Equipment Sharing",
            description:
              "Connect with nearby farmers to share expensive equipment and reduce operational costs.",
          },
          {
            title: "Expert Consultation",
            description:
              "Find and consult with agricultural experts for specific crop or livestock challenges.",
          },
          {
            title: "Supply Chain Partnerships",
            description:
              "Build relationships with suppliers and distributors to optimize your supply chain.",
          },
        ],
      },
      knowledgeExchange: {
        detailedDescription:
          "Our Knowledge Exchange platform revolutionizes how agricultural knowledge is shared and accessed. From cutting-edge research to time-tested farming practices, our platform ensures that valuable insights reach those who need them most, when they need them.",
        benefits: [
          "Access to 5,000+ research papers and case studies",
          "Live expert consultations and Q&A sessions",
          "Interactive workshops and training modules",
          "Best practice sharing community",
          "Multilingual content library",
          "Mobile-first learning experience",
        ],
        useCases: [
          {
            title: "Crop Disease Diagnosis",
            description:
              "Get instant access to disease identification tools and treatment recommendations.",
          },
          {
            title: "Sustainable Farming Practices",
            description:
              "Learn about eco-friendly farming methods that improve yield and reduce environmental impact.",
          },
          {
            title: "Market Trend Analysis",
            description:
              "Stay updated with the latest market trends and pricing information.",
          },
        ],
      },
      partnershipFacilitation: {
        detailedDescription:
          "Our Partnership Facilitation service acts as a bridge between agricultural stakeholders, creating strategic alliances that drive innovation and growth. We use advanced matching algorithms and human expertise to identify and facilitate partnerships that create mutual value.",
        benefits: [
          "AI-powered partner matching system",
          "Legal and contract support services",
          "Due diligence assistance",
          "Partnership success tracking",
          "Conflict resolution support",
          "International partnership opportunities",
        ],
        useCases: [
          {
            title: "Technology Integration",
            description:
              "Partner with tech companies to implement smart farming solutions.",
          },
          {
            title: "Market Expansion",
            description:
              "Find distribution partners to expand into new geographic markets.",
          },
          {
            title: "Research Collaboration",
            description:
              "Collaborate with research institutions on innovative agricultural projects.",
          },
        ],
      },
      verifiedExpertise: {
        detailedDescription:
          "Our Verified Expertise service ensures that you're connecting with genuine, qualified agricultural professionals. Through our rigorous verification process, we validate credentials, experience, and expertise to build trust in our community.",
        benefits: [
          "Multi-level verification process",
          "Credential and certification validation",
          "Experience verification through references",
          "Continuous performance monitoring",
          "Trust scoring system",
          "Insurance and liability coverage",
        ],
        useCases: [
          {
            title: "Expert Hiring",
            description:
              "Hire verified agricultural consultants with confidence in their qualifications.",
          },
          {
            title: "Skill Validation",
            description:
              "Validate your own skills and get recognized as a verified expert.",
          },
          {
            title: "Quality Assurance",
            description:
              "Ensure all partnerships are with verified, trustworthy professionals.",
          },
        ],
      },
      marketInsights: {
        detailedDescription:
          "Our Market Insights service provides real-time agricultural market data, trends, and analytics to help you make informed business decisions. From commodity prices to weather patterns, we aggregate data from multiple sources to give you a competitive edge.",
        benefits: [
          "Real-time commodity price tracking",
          "Weather and climate data integration",
          "Market trend analysis and forecasting",
          "Supply and demand analytics",
          "Custom alerts and notifications",
          "Historical data and trend analysis",
        ],
        useCases: [
          {
            title: "Price Optimization",
            description:
              "Optimize selling prices based on real-time market data and trends.",
          },
          {
            title: "Crop Planning",
            description:
              "Plan crop selection based on market demand forecasts.",
          },
          {
            title: "Risk Management",
            description:
              "Identify and mitigate market risks through data-driven insights.",
          },
        ],
      },
      businessGrowth: {
        detailedDescription:
          "Our Business Growth service provides comprehensive tools and resources to help agricultural businesses scale and succeed. From business planning to funding opportunities, we support your growth journey every step of the way.",
        benefits: [
          "Business plan templates and tools",
          "Funding opportunity matching",
          "Growth strategy consulting",
          "Performance tracking and analytics",
          "Mentorship programs",
          "Market expansion support",
        ],
        useCases: [
          {
            title: "Startup Launch",
            description:
              "Get comprehensive support to launch your agricultural startup successfully.",
          },
          {
            title: "Scale Operations",
            description:
              "Access tools and resources to scale your existing agricultural business.",
          },
          {
            title: "Funding Acquisition",
            description:
              "Connect with investors and funding opportunities tailored to agriculture.",
          },
        ],
      },
    },
    contact: {
      tagline: "We're Here to Help",
      title: "Get in Touch",
      description:
        "Have questions about our platform? We're here to help you connect with the agricultural community.",
      form: {
        title: "Send Us a Message",
        name: "Name",
        namePlaceholder: "Enter your name",
        email: "Email Address",
        emailPlaceholder: "Enter your email address",
        role: "I am a",
        farmer: "Farmer",
        technician: "Technician",
        entrepreneur: "Entrepreneur",
        subject: "Subject",
        subjectPlaceholder: "Enter subject",
        message: "Message",
        messagePlaceholder: "Enter your message",
        submit: "Send Message",
        submited: "Message sent!",
        nameError: "Name is required",
        emailError: "Valid email is required",
        messageError: "Message is required",
        emailInvalid: "Invalid email address",
        messageLength: "Message must be at least 10 characters",
        messageSent: "Message sent successfully!",
        messageSending: "Sending message...",
        messageSendingError: "Error sending message. Please try again.",
        messageSendingSuccess: "Your message has been sent successfully!",
        success: "Your message has been sent successfully!",
        error: "An error occurred. Please try again.",
      },
      contactInfo: {
        title: "Contact Information",
        description:
          "Choose the best way to reach us. We're available through multiple channels.",
        visitUs: "Visit Us",
        emailUs: "Email Us",
        callUs: "Call Us",
        businessHours: "Business Hours",
        monday: "Monday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        closed: "Closed",
      },
    },
    faq: {
      tagline: "Get Your Questions Answered",
      title: "Frequently Asked Questions",
      description:
        "Find answers to common questions about Agrovie and how it can help you succeed in agriculture.",
      searchPlaceholder: "Search questions...",
      tags: [
        "All Questions",
        "General",
        "For Farmers",
        "For Technicians",
        "For Entrepreneurs",
      ],
      question1: {
        question: "What is Agrovie?",
        answer:
          "Agrovie is a professional networking platform designed specifically for the agricultural industry. We connect farmers, agricultural technicians, and entrepreneurs to facilitate collaboration, knowledge sharing, and business growth.",
      },
      question2: {
        question: "How can farmers benefit from the platform?",
        answer:
          "Farmers can connect with agricultural experts, access modern farming techniques, find equipment suppliers, and share experiences with other farmers. The platform also provides market insights and weather updates.",
      },
      question3: {
        question: "What opportunities exist for agricultural technicians?",
        answer:
          "Agricultural technicians can offer their services, share expertise, connect with farmers needing technical support, and stay updated with the latest agricultural technologies and methodologies.",
      },
      question4: {
        question: "How does Agrovie support agri-entrepreneurs?",
        answer:
          "Entrepreneurs can discover business opportunities, connect with potential partners, access market data, and find investment opportunities in the agricultural sector.",
      },
      question5: {
        question: "Is the platform free to use?",
        answer:
          "We offer both free and premium membership tiers. The free tier provides basic networking features, while premium members get access to advanced tools, detailed analytics, and priority support.",
      },
      question6: {
        question: "Can I sell my products directly on the platform?",
        answer:
          "Yes, verified farmers can list their products in our marketplace, connecting directly with buyers and distributors.",
      },
      question7: {
        question: "How are technical service providers verified?",
        answer:
          "We verify technical service providers through a comprehensive process including credential verification, experience validation, and peer reviews.",
      },
      question8: {
        question: "What types of market data are available?",
        answer:
          "Premium members get access to real-time market prices, demand forecasts, regional agricultural trends, and investment opportunity analyses.",
      },
      question9: {
        question: "How can I contact customer support?",
        answer: "Customer support is available via email, phone, or live chat.",
      },
      questionNotFound: "No questions found matching your search.",
      stillHaveQuestions: "Still have questions?",
      cannotFind:
        "Can't find what you're looking for? Our support team is here to help.",
      contactSupportButton: "Contact Support",
    },
    blog: {
      tagline: "Latest Agricultural Insights",
      title: "Agricultural Insights & Updates",
      description:
        "Stay informed with the latest news, trends, and insights in agriculture and technology.",
      read: "read",
      readMore: "Read More",
      recentPosts: "Recent Posts",
      categories: "Categories",
      searchPlaceholder: "Search articles...",
      noResults: "No articles found",
      allCategories: "All Categories",
      technology: "Technology",
      agriculture: "Agriculture",
      sustainability: "Sustainability",
      innovation: "Innovation",
      business: "Business",
      by: "By",
    },
    termsOfService: {
      title: "Terms of Service",
      lastUpdated: "Last updated",
      description:
        "Please read these Terms of Service carefully before using Agrovie's platform and services.",
      agreementToTerms: "Agreement to Terms",
      agreementToTermsContent:
        "BBy accessing or using Agrovie's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.",
      accountSecurity: "Account Security",
      accountSecurityContent:
        "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
      userConduct: "User Conduct",
      userConductContent: "You agree not to:",
      userCondut1: " Post or transmit harmful or malicious content",
      userCondut2: " Impersonate any person or entity",
      userCondut3: " Interfere with or disrupt our services",
      userCondut4: "  Collect user information without consent",
      userCondut5: " Use our services for illegal purposes",
      termination: "Termination",
      terminationContent:
        "We reserve the right to terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.",
      intellectualProperty: "Intellectual Property",
      intellectualPropertyContent:
        "The service and its original content, features, and functionality are owned by Agrovie and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
      communitcation: "Communication",
      communitcationContent:
        "By creating an account, you agree to receive communications from us, including newsletters, updates, and promotional materials. You can opt out of marketing communications at any time.",
      contactInfo: "Contact Information",
      contactInfoContent:
        "If you have any questions about these Terms of Service, please contact us at:",
      email: "Email: support@agrovie.africa",
      phone: "Phone: +22674189763",
      address: "Ouagadougou, Burkina Faso",
    },
    privacyPolicy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated",
      description:
        "At Agrovie, we take your privacy seriously. This privacy policy describes how we collect, use, and protect your personal information.",
      informationCollection: "Information Collection",
      informationCollectionContent:
        "We collect information that you provide directly to us, including:",
      personalInformation: "Personal information (name, email, phone number)",
      professionalInformation: "Professional information (occupation, company)",
      accountCredentials: "Account credentials",
      communicationPreferences: "Communication preferences",
      dataSecurity: "Data Security",
      dataSecurityContent:
        "We implement appropriate technical and organizational security measures to protect your personal data against accidental or unlawful destruction, loss, alteration, and unauthorized disclosure or access.",
      informationUsage: " Information Usage",
      informationUsageContent: "Your information is used to:",
      provideAndMaintainService: "Provide and maintain our services",
      processTransaction: "Process your transactions",
      sendTechnicalNotice: "Send you technical notices and support messages",
      communicateProduct:
        "Communicate with you about products, services, and events",
      respondComment: "Respond to your comments and questions",
      userRights: "User Rights",
      userRightsContent: "You have the right to:",
      accessYourInformation: "Access your information",
      correctYourInformation: "Correct your information",
      deleteYourInformation: "Delete your information",
      objectDataProcessing: "Object to data processing",
      requestDataPortability: "Request data portability",
      dataRetention: "Data Retention",
      dataRetentionContent:
        "We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You can request deletion of your data at any time.",
      updatesToPolicy: "Updates to Policy",
      updatesToPolicyContent:
        "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.",
      contactInfo: "Contact Information",
      contactInfoContent:
        "If you have any questions about this Privacy Policy, please contact us at:",
      email: "Email: support@agrovie.africa",
      phone: "Phone: +22674189763",
      address: "Ouagadougou, Burkina Faso",
    },
    register: {
      title: "Create an Account",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      invalidName: "Name must be at least 2 characters",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      invalidEmail: "Invalid email address",
      PhoneNumber: "Phone Number",
      phoneNumberPlaceholder: "Enter your phone number",
      invalidPhoneNumber: "Invalid phone number",
      role: "Role",
      invalidRole:
        "Invalid enum value. Expected 'Worker' | 'Technician' | 'Entrepreneur', received ''",
      selectRole: "Select a Role",
      worker: "Worker",
      technician: "Technician",
      entrepreneur: "Entrepreneur",
      password: "Password",
      invalidPassword: "Password must be at least 8 characters",
      confirmPassword: "Confirm Password",
      registerButton: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      loginInstead: "Sign in instead",
      loginButton: "Sign In",
      passwordRequirement: "Password Requirements",
      req1: "At least 8 characters",
      req2: "At least 1 uppercase letter",
      req3: "At least 1 lowercase letter",
      req4: "At least 1 number",
      req5: "At least 1 special character",
      termsAndConditions:
        "By creating an account, you agree to our Terms and Conditions.",
    },
    login: {
      title: "Sign In to Your Account",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      password: "Password",
      passwordPlaceholder: "........",
      forgotPassword: "Forgot Password?",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      registerInstead: "Register instead",
      registerButton: "Register",
      invalidEmail: "Invalid email address",
      passwordRequired: "Password is required",
      signIn: "Sign In",
      signingIn: "Signing in...",
    },
    forgotPassword: {
      title: "Reset your Password",
      description:
        "Enter your email address and we'll send you a link to reset your password.",
      invalidEmail: "Please enter a valid email address",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      sendResetLink: "Send Reset Link",
      sending: "Sending reset link...",
      or: "Or",
      backToLogin: "Back to Login",
      backToHome: "Back to Home",
      success: "Success!",
      resetLinkSent1: "We've sent a password reset link to",
      resetLinkSent2:
        "Please check your email and follow the instructions to reset your password.",
      goToHome: "Go to Home",
      error: "An error occurred. Please try again.",
      emailInvalid: "Invalid email address",
      emailRequired: "Email address is required",
      emailNotFound: "Email address not found",
      emailSent: "Email sent successfully!",
      emailSending: "Sending email...",
      instruction:
        "Click the link in the email to reset your password. If you don't see the email, check your spam folder.",
      tryAnotherEmail: "Try another email",
      resetLinkTitle: "Success! Check your email",
      requestAnotherLink: "Request another link",
      resetLinkSent: "Reset link sent successfully!",
      checkEmail:
        "Check your email for the reset link. If you don't find it, try checking your spam folder.",
    },
    resetPassword: {
      title: "Reset Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      submit: "Reset Password",
      requirements: "Password Requirements",
      success: "Password successfully reset!",
      error: "An error occurred. Please try again.",
    },
    adminLogin: {
      title: "Admin Login",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      password: "Password",
      passwordPlaceholder: "........",
      loginButton: "Sign In",
      invalidEmail: "Invalid email address",
      passwordRequired: "Password is required",
    },
  },
};
