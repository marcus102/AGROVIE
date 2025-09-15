import { motion } from "framer-motion";
import { Users, Target, Sprout, Award, Quote, MapPin, Mail } from "lucide-react";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";

interface AboutProps {
  language: Language;
  translations: Translations[Language];
}

export function About({ translations }: AboutProps) {
  const team = [
    {
      name: "Aymard P. SAWADOGO",
      role: "Agronome, Expert consultant en sécurité alimentaire et nutrition & Co-fondateur",
      image: "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/Eymar.jpg",
      bio: "9 ans d’expérience en conseil agricole et chaine de valeur",
      social: { email: "aymard@agrovie.africa", location: "Ouagadougou, BF" }
    },
    {
      name: "Marcus W. SAWADOGO",
      role: "Developpeur fullstack & Co-Fondateur",
      image: "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/Marcus.jpg",
      bio: "Software engineer with a passion for agriculture",
      social: { email: "marcus@agrovie.africa", location: "Ouagadougou, BF" }
    },
    {
      name: "Razack A. NIKIEMA",
      role: "développeur de solutions IoT & Co-Fondateur",
      image: "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/WhatsApp%20Image%202025-05-17%20at%2020.18.58_1ae41512.jpg",
      bio: "Expert in agricultural partnerships",
      social: { email: "razack@agrovie.africa", location: "Ouagadougou, BF" }
    },
    {
      name: "Ariane P. SAWADOGO",
      role: "Directrice Générale de Expertise Rurale, Ingénieur en aménagement hydro-agricole & Co-fondatrice",
      image: "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/Ariane.jpg",
      bio: "Ingénieur en aménagement hydro-agricole",
      social: { email: "ariane@agrovie.africa", location: "Ouagadougou, BF" }
    },
  ];

  const values = [
    {
      icon: Users,
      title: translations.about.communityFirst,
      description: translations.about.communityFirstDescription,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Target,
      title: translations.about.innovationDriven,
      description: translations.about.innovationDrivenDescription,
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Sprout,
      title: translations.about.sustainabilityFocused,
      description: translations.about.sustainabilityFocusedDescription,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Award,
      title: translations.about.excellence,
      description: translations.about.excellenceDescription,
      gradient: "from-purple-500 to-purple-600",
    },
  ];
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/agriculture-riz-ghana.webp"
            alt="Agriculture background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <Quote className="w-4 h-4 mr-2" />
              Building the Future of Agriculture
            </motion.div>
            
            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              <span className="block">{translations.about.title}</span>
            </motion.h1>
            
            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed"
            >
              {translations.about.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        {/* Mission Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Target className="w-4 h-4 mr-2" />
                {translations.about.mission}
              </div>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {translations.about.missionDescription}
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/agriculture-riz-ghana.webp"
                  alt="Agricultural innovation"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              </div>
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800"
              >
                <div className="text-3xl font-bold text-primary mb-1">😊</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              {translations.about.ourValue}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.about.ourValueDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title + index}
                  variants={fadeIn}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
               {translations.about.ourTeam}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.about.ourTeamDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name + index}
                variants={fadeIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{member.bio}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      {member.social.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {member.social.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Layout>
    </div>
  );
}