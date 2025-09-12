import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BaseModal } from './BaseModal';
import { Check, Globe } from 'lucide-react-native';
import { LANGUAGES } from '@/types/language';
import { useLanguageStore } from '@/stores/language';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const { language, setLanguage } = useLanguageStore();
  const { colors } = useThemeStore();

  const handleLanguageSelect = (code: typeof language) => {
    setLanguage(code);
    onClose();
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choisir la langue
        </Text>
        
        <ScrollView style={styles.content}>
          {LANGUAGES.map((lang, index) => (
            <Animated.View
              key={lang.code}
              entering={FadeInDown.delay(index * 100)}
            >
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  { backgroundColor: colors.card },
                  language === lang.code && {
                    backgroundColor: colors.primary + '20',
                  },
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <View style={styles.languageInfo}>
                 <Globe size={24} color={colors.primary} style={styles.flag} />
                  <View style={styles.languageText}>
                    <Text style={[styles.languageName, { color: colors.text }]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={[styles.languageNative, { color: colors.muted }]}>
                      {lang.name}
                    </Text>
                  </View>
                </View>
                
                {language === lang.code && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  content: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  languageNative: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});