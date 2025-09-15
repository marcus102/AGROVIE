import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Sprout,
  TrendingUp,
  ShieldCheck,
  Handshake,
  BarChart3,
  Check,
  ArrowLeft,
  Star,
  Zap,
  Globe,
  Target,
  Award,
  MessageSquare,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import {
  fadeIn,
  staggerContainer,
  slideIn,
  cardHover,
} from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";

interface ServiceDetailProps {
  language: Language;
  translations: Translations[Language];
}

export function ServiceDetail({ translations, language }: ServiceDetailProps) {
  const { serviceId } = useParams();
  const t = translations.serviceDetail;

  const services = {
    "network-building": {
      icon: Users,
      name: translations.services.service1.name,
      description: translations.services.service1.description,
      features: translations.services.service1.features,
      gradient: "from-blue-500 to-blue-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/glenn-carstens-peters-piNf3C4TViA-unsplash.jpg",
      detailedDescription: t.networkBuilding.detailedDescription,
      benefits: t.networkBuilding.benefits,
      useCases: [
        {
          title: t.networkBuilding.useCases[0].title,
          description: t.networkBuilding.useCases[0].description,
          icon: Target,
        },
        {
          title: t.networkBuilding.useCases[1].title,
          description: t.networkBuilding.useCases[1].description,
          icon: MessageSquare,
        },
        {
          title: t.networkBuilding.useCases[2].title,
          description: t.networkBuilding.useCases[2].description,
          icon: Handshake,
        },
      ],
      testimonials: [
        {
          quote:
            "Through AgroNetwork, I connected with a soil expert who helped increase my crop yield by 30%.",
          author: "Maria Santos",
          role: "Organic Farmer",
          image:
            "https://images.pexels.com/photos/5717277/pexels-photo-5717277.jpeg",
        },
        {
          quote:
            "The networking opportunities have been incredible. I've found three new business partners.",
          author: "John Mitchell",
          role: "Agricultural Entrepreneur",
          image:
            "https://images.pexels.com/photos/8851637/pexels-photo-8851637.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: [
            "Basic profile",
            "Limited connections",
            "Community access",
          ],
        },
        premium: {
          price: "$29/month",
          features: [
            "Unlimited connections",
            "Advanced search",
            "Priority support",
            "Analytics dashboard",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Custom integrations",
            "Dedicated support",
            "White-label options",
            "API access",
          ],
        },
      },
    },
    "knowledge-exchange": {
      icon: Sprout,
      name: translations.services.service2.name,
      description: translations.services.service2.description,
      features: translations.services.service2.features,
      gradient: "from-green-500 to-green-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/knowledgeshare.jpg",
      detailedDescription: t.knowledgeExchange.detailedDescription,
      benefits: t.knowledgeExchange.benefits,
      useCases: [
        {
          title: t.knowledgeExchange.useCases[0].title,
          description: t.knowledgeExchange.useCases[0].description,
          icon: Target,
        },
        {
          title: t.knowledgeExchange.useCases[1].title,
          description: t.knowledgeExchange.useCases[1].description,
          icon: Sprout,
        },
        {
          title: t.knowledgeExchange.useCases[2].title,
          description: t.knowledgeExchange.useCases[2].description,
          icon: TrendingUp,
        },
      ],
      testimonials: [
        {
          quote:
            "The knowledge base helped me identify and treat a crop disease that could have cost me thousands.",
          author: "Ahmed Hassan",
          role: "Wheat Farmer",
          image:
            "https://images.pexels.com/photos/5717526/pexels-photo-5717526.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: ["Basic articles", "Community Q&A", "Monthly webinars"],
        },
        premium: {
          price: "$39/month",
          features: [
            "Premium content",
            "Expert consultations",
            "Certification courses",
            "Offline access",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Custom training programs",
            "Dedicated expert",
            "Team management",
            "Progress tracking",
          ],
        },
      },
    },
    "partnership-facilitation": {
      icon: Handshake,
      name: translations.services.service3.name,
      description: translations.services.service3.description,
      features: translations.services.service3.features,
      gradient: "from-purple-500 to-purple-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/partnership.jpg",
      detailedDescription: t.partnershipFacilitation.detailedDescription,
      benefits: t.partnershipFacilitation.benefits,
      useCases: [
        {
          title: t.partnershipFacilitation.useCases[0].title,
          description: t.partnershipFacilitation.useCases[0].description,
          icon: Zap,
        },
        {
          title: t.partnershipFacilitation.useCases[1].title,
          description: t.partnershipFacilitation.useCases[1].description,
          icon: Globe,
        },
        {
          title: t.partnershipFacilitation.useCases[2].title,
          description: t.partnershipFacilitation.useCases[2].description,
          icon: BookOpen,
        },
      ],
      testimonials: [
        {
          quote:
            "AgroNetwork helped us find the perfect technology partner for our smart irrigation project.",
          author: "Sarah Chen",
          role: "Farm Manager",
          image:
            "https://images.pexels.com/photos/5717277/pexels-photo-5717277.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: [
            "Basic partner search",
            "Profile matching",
            "Introduction facilitation",
          ],
        },
        premium: {
          price: "$99/month",
          features: [
            "Advanced matching",
            "Legal support",
            "Due diligence",
            "Success tracking",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Dedicated partnership manager",
            "Custom agreements",
            "International support",
            "Priority matching",
          ],
        },
      },
    },
    "verified-expertise": {
      icon: ShieldCheck,
      name: translations.services.service4.name,
      description: translations.services.service4.description,
      features: translations.services.service4.features,
      gradient: "from-emerald-500 to-emerald-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/verifiedexpertize.jpg",
      detailedDescription: t.verifiedExpertise.detailedDescription,
      benefits: t.verifiedExpertise.benefits,
      useCases: [
        {
          title: t.verifiedExpertise.useCases[0].title,
          description: t.verifiedExpertise.useCases[0].description,
          icon: Users,
        },
        {
          title: t.verifiedExpertise.useCases[1].title,
          description: t.verifiedExpertise.useCases[1].description,
          icon: Award,
        },
        {
          title: t.verifiedExpertise.useCases[2].title,
          description: t.verifiedExpertise.useCases[2].description,
          icon: ShieldCheck,
        },
      ],
      testimonials: [
        {
          quote:
            "The verification system gave me confidence to hire a consultant for my organic certification.",
          author: "Robert Johnson",
          role: "Organic Farmer",
          image:
            "https://images.pexels.com/photos/8851637/pexels-photo-8851637.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: ["Basic verification", "Profile badge", "Trust score"],
        },
        premium: {
          price: "$49/month",
          features: [
            "Enhanced verification",
            "Priority listing",
            "Insurance coverage",
            "Performance tracking",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Custom verification criteria",
            "Bulk verification",
            "API integration",
            "White-label verification",
          ],
        },
      },
    },
    "market-insights": {
      icon: BarChart3,
      name: translations.services.service5.name,
      description: translations.services.service5.description,
      features: translations.services.service5.features,
      gradient: "from-orange-500 to-orange-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/marketinginsight.jpg",
      detailedDescription: t.marketInsights.detailedDescription,
      benefits: t.marketInsights.benefits,
      useCases: [
        {
          title: t.marketInsights.useCases[0].title,
          description: t.marketInsights.useCases[0].description,
          icon: TrendingUp,
        },
        {
          title: t.marketInsights.useCases[1].title,
          description: t.marketInsights.useCases[1].description,
          icon: Target,
        },
        {
          title: t.marketInsights.useCases[2].title,
          description: t.marketInsights.useCases[2].description,
          icon: ShieldCheck,
        },
      ],
      testimonials: [
        {
          quote:
            "The market insights helped me time my harvest perfectly, increasing my profits by 25%.",
          author: "Lisa Wang",
          role: "Commodity Farmer",
          image:
            "https://images.pexels.com/photos/5717526/pexels-photo-5717526.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: ["Basic price data", "Weekly reports", "Limited alerts"],
        },
        premium: {
          price: "$79/month",
          features: [
            "Real-time data",
            "Advanced analytics",
            "Custom alerts",
            "API access",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Custom data feeds",
            "Dedicated analyst",
            "White-label reports",
            "Integration support",
          ],
        },
      },
    },
    "business-growth": {
      icon: TrendingUp,
      name: translations.services.service6.name,
      description: translations.services.service6.description,
      features: translations.services.service6.features,
      gradient: "from-red-500 to-red-600",
      image:
        "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/businessgrowth.jpg",
      detailedDescription: t.businessGrowth.detailedDescription,
      benefits: t.businessGrowth.benefits,
      useCases: [
        {
          title: t.businessGrowth.useCases[0].title,
          description: t.businessGrowth.useCases[0].description,
          icon: Zap,
        },
        {
          title: t.businessGrowth.useCases[1].title,
          description: t.businessGrowth.useCases[1].description,
          icon: TrendingUp,
        },
        {
          title: t.businessGrowth.useCases[2].title,
          description: t.businessGrowth.useCases[2].description,
          icon: Target,
        },
      ],
      testimonials: [
        {
          quote:
            "The business growth tools helped me secure funding and expand my farm operations.",
          author: "Michael Brown",
          role: "Farm Owner",
          image:
            "https://images.pexels.com/photos/8851637/pexels-photo-8851637.jpeg",
        },
      ],
      pricing: {
        basic: {
          price: t.pricingPlans.free,
          features: ["Basic tools", "Community access", "Monthly webinars"],
        },
        premium: {
          price: "$149/month",
          features: [
            "Advanced tools",
            "1-on-1 consulting",
            "Funding matching",
            "Growth tracking",
          ],
        },
        enterprise: {
          price: t.pricingPlans.custom,
          features: [
            "Dedicated consultant",
            "Custom strategy",
            "Priority funding access",
            "Team training",
          ],
        },
      },
    },
  };

  const service = services[serviceId as keyof typeof services];

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t.serviceNotFound.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t.serviceNotFound.description}
          </p>
          <Link
            to="/services"
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t.serviceNotFound.backToServices}
          </Link>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="absolute inset-0">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              whileHover={{ x: -5 }}
              className="mb-8 flex justify-center"
            >
              <Link
                to="/services"
                className="inline-flex items-center text-white/80 hover:text-white font-medium transition-colors duration-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t.serviceNotFound.backToServices}
              </Link>
            </motion.div>

            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <Icon className="w-4 h-4 mr-2" />
              {t.professionalService}
            </motion.div>

            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              {service.name}
            </motion.h1>

            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              {service.detailedDescription}
            </motion.p>

            <motion.div
              variants={slideIn}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >


              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-primary bg-white hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                >
                  <PlayCircle className="mr-3 h-6 w-6" />
                  {t.getStarted}
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white border-2 border-white/30 hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <MessageSquare className="mr-3 h-6 w-6" />
                  {t.contactSales}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        {/* Benefits Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              {t.keyBenefits.title}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {t.keyBenefits.heading}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.keyBenefits.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={cardHover}
                className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Use Cases Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              {t.useCases.title}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {t.useCases.heading}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.useCases.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {service.useCases.map((useCase, index) => {
              const UseCaseIcon = useCase.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={cardHover}
                  className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 text-center"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <UseCaseIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        {/* <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.successStories.title}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {t.successStories.heading}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.successStories.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={cardHover}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 p-8"
              >
                <div className="relative mb-6">
                  <div className="text-6xl text-primary/20 font-serif absolute -top-2 -left-2">
                    "
                  </div>
                  <p className="relative text-gray-600 dark:text-gray-300 italic leading-relaxed text-lg">
                    {testimonial.quote}
                  </p>
                </div>

                <div className="flex items-center">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div className="ml-4">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-primary">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* Pricing Section */}
        {/* <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t.pricingPlans.title}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {t.pricingPlans.heading}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.pricingPlans.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(service.pricing).map(([planName, plan], index) => (
              <motion.div
                key={planName}
                variants={fadeIn}
                whileHover={cardHover}
                className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 p-8 ${
                  planName === 'premium' 
                    ? 'border-primary scale-105' 
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                {planName === 'premium' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {t.pricingPlans.mostPopular}
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 capitalize">
                    {planName}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.price !== t.pricingPlans.free && plan.price !== t.pricingPlans.custom && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">{t.pricingPlans.perMonth}</span>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                      planName === 'premium'
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {plan.price === t.pricingPlans.custom ? t.pricingPlans.contactSales : t.getStarted}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* CTA Section */}
        {/* <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center mx-auto mb-8`}>
                <Icon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t.readyToGetStarted.heading}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t.readyToGetStarted.description.replace('{serviceName}', service.name.toLowerCase())}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <PlayCircle className="w-6 h-6 mr-3" />
                  {t.readyToGetStarted.startFreeTrial}
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    {t.contactSales}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div> */}
      </Layout>
    </div>
  );
}
