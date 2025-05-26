import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Moon,
  Globe,
  KeyRound,
  Shield,
  Info,
  ChevronRight,
  LogOut,
  Share as ShareIcon,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useLanguageStore } from '@/stores/language';
import { LANGUAGES } from '@/types/language';
import { LanguageModal } from '@/components/modals/LanguageModal';
import { PasswordModal } from '@/components/modals/PasswordModal';
import { EmailUpdateModal } from '@/components/modals/EmailSettingsModal';
import NotificationSettingsModal from '@/components/modals/NotificationSettingsModal';

type MenuItemProps = {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showToggle?: boolean;
  isToggled?: boolean;
  showChevron?: boolean;
};

const MenuItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  showToggle,
  isToggled,
  showChevron = true,
}: MenuItemProps) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>
        <Icon size={24} color={colors.primary} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuItemSubtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showToggle ? (
        <Switch
          value={isToggled}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={isToggled ? colors.primary : colors.muted}
          ios_backgroundColor={colors.border}
        />
      ) : showChevron ? (
        <ChevronRight size={20} color={colors.muted} />
      ) : null}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useThemeStore();
  const { language } = useLanguageStore();
  const { signOut } = useAuthStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === language);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message:
          'Découvrez AGRO, la plateforme qui connecte les talents agricoles : https://agro-app.com',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Général
        </Text>
        <MenuItem
          icon={Globe}
          title="Langue"
          subtitle={
            selectedLanguage?.code === 'en'
              ? ` ${selectedLanguage?.nativeName}  (Disponible bientôt)`
              : ` ${selectedLanguage?.nativeName}`
          }
          onPress={() => setShowLanguageModal(true)}
        />
        <MenuItem
          icon={Moon}
          title="Mode sombre"
          showToggle
          isToggled={theme === 'dark'}
          onPress={handleThemeToggle}
        />
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Notifications
        </Text>
        <MenuItem
          icon={Bell}
          title="Paramètres des notifications"
          onPress={() => setShowNotificationsModal(true)} // Show NotificationSettingsModal
        />
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Sécurité
        </Text>
        <MenuItem
          icon={KeyRound}
          title="Modifier le mot de passe"
          onPress={() => setShowPasswordModal(true)}
        />
        <MenuItem
          icon={Shield}
          title="Modifier l'email"
          onPress={() => setShowEmailModal(true)}
        />
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Partager l'application
        </Text>
        <MenuItem
          icon={ShareIcon}
          title="Partager AGRO"
          onPress={handleShareApp}
        />
      </View>

      {/* À propos Section */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          À propos
        </Text>
        <MenuItem
          icon={Info}
          title="Mentions légales"
          onPress={() =>
            Linking.openURL('http://localhost:5173/terms-of-service')
          }
        />
        <MenuItem
          icon={Shield}
          title="Politique de confidentialité"
          onPress={() =>
            Linking.openURL('http://localhost:5173/privacy-policy')
          }
        />
        <MenuItem
          icon={Info}
          title="Version"
          subtitle="1.0.0"
          showChevron={false}
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error + '20' }]}
        onPress={handleSignOut}
      >
        <LogOut size={24} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>
          Déconnexion
        </Text>
      </TouchableOpacity>

      {/* Modals */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <PasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <NotificationSettingsModal
        visible={showNotificationsModal} // Pass visibility state
        onClose={() => setShowNotificationsModal(false)} // Close modal
      />

      <EmailUpdateModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemIcon: {
    width: 32,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  menuItemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 24,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
});
