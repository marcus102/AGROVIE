import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Search, X, Globe } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: '+93', label: 'Afghanistan', flag: '🇦🇫' },
  { code: '+358', label: 'Åland Islands', flag: '🇦🇽' },
  { code: '+355', label: 'Albania', flag: '🇦🇱' },
  { code: '+213', label: 'Algeria', flag: '🇩🇿' },
  { code: '+1 684', label: 'American Samoa', flag: '🇦🇸' },
  { code: '+376', label: 'Andorra', flag: '🇦🇩' },
  { code: '+244', label: 'Angola', flag: '🇦🇴' },
  { code: '+1 264', label: 'Anguilla', flag: '🇦🇮' },
  { code: '+672', label: 'Antarctica', flag: '🇦🇶' },
  { code: '+1 268', label: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', label: 'Argentina', flag: '🇦🇷' },
  { code: '+374', label: 'Armenia', flag: '🇦🇲' },
  { code: '+297', label: 'Aruba', flag: '🇦🇼' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+43', label: 'Austria', flag: '🇦🇹' },
  { code: '+994', label: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1 242', label: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', label: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', label: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1 246', label: 'Barbados', flag: '🇧🇧' },
  { code: '+375', label: 'Belarus', flag: '🇧🇾' },
  { code: '+32', label: 'Belgium', flag: '🇧🇪' },
  { code: '+501', label: 'Belize', flag: '🇧🇿' },
  { code: '+229', label: 'Benin', flag: '🇧🇯' },
  { code: '+1 441', label: 'Bermuda', flag: '🇧🇲' },
  { code: '+975', label: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', label: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', label: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', label: 'Botswana', flag: '🇧🇼' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
  { code: '+246', label: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+1 284', label: 'British Virgin Islands', flag: '🇻🇬' },
  { code: '+673', label: 'Brunei', flag: '🇧🇳' },
  { code: '+359', label: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', label: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', label: 'Burundi', flag: '🇧🇮' },
  { code: '+855', label: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', label: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', label: 'Canada', flag: '🇨🇦' },
  { code: '+238', label: 'Cape Verde', flag: '🇨🇻' },
  { code: '+1 345', label: 'Cayman Islands', flag: '🇰🇾' },
  { code: '+236', label: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', label: 'Chad', flag: '🇹🇩' },
  { code: '+56', label: 'Chile', flag: '🇨🇱' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+61', label: 'Christmas Island', flag: '🇨🇽' },
  { code: '+61', label: 'Cocos Islands', flag: '🇨🇨' },
  { code: '+57', label: 'Colombia', flag: '🇨🇴' },
  { code: '+269', label: 'Comoros', flag: '🇰🇲' },
  { code: '+682', label: 'Cook Islands', flag: '🇨🇰' },
  { code: '+506', label: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', label: 'Croatia', flag: '🇭🇷' },
  { code: '+53', label: 'Cuba', flag: '🇨🇺' },
  { code: '+599', label: 'Curaçao', flag: '🇨🇼' },
  { code: '+357', label: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', label: 'Czech Republic', flag: '🇨🇿' },
  { code: '+243', label: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: '+45', label: 'Denmark', flag: '🇩🇰' },
  { code: '+253', label: 'Djibouti', flag: '🇩🇯' },
  { code: '+1 767', label: 'Dominica', flag: '🇩🇲' },
  { code: '+1 809', label: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+670', label: 'East Timor', flag: '🇹🇱' },
  { code: '+593', label: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', label: 'Egypt', flag: '🇪🇬' },
  { code: '+503', label: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', label: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', label: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', label: 'Estonia', flag: '🇪🇪' },
  { code: '+251', label: 'Ethiopia', flag: '🇪🇹' },
  { code: '+500', label: 'Falkland Islands', flag: '🇫🇰' },
  { code: '+298', label: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+679', label: 'Fiji', flag: '🇫🇯' },
  { code: '+358', label: 'Finland', flag: '🇫🇮' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+689', label: 'French Polynesia', flag: '🇵🇫' },
  { code: '+241', label: 'Gabon', flag: '🇬🇦' },
  { code: '+220', label: 'Gambia', flag: '🇬🇲' },
  { code: '+995', label: 'Georgia', flag: '🇬🇪' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+233', label: 'Ghana', flag: '🇬🇭' },
  { code: '+350', label: 'Gibraltar', flag: '🇬🇮' },
  { code: '+30', label: 'Greece', flag: '🇬🇷' },
  { code: '+299', label: 'Greenland', flag: '🇬🇱' },
  { code: '+1 473', label: 'Grenada', flag: '🇬🇩' },
  { code: '+1 671', label: 'Guam', flag: '🇬🇺' },
  { code: '+502', label: 'Guatemala', flag: '🇬🇹' },
  { code: '+44 1481', label: 'Guernsey', flag: '🇬🇬' },
  { code: '+224', label: 'Guinea', flag: '🇬🇳' },
  { code: '+245', label: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', label: 'Guyana', flag: '🇬🇾' },
  { code: '+509', label: 'Haiti', flag: '🇭🇹' },
  { code: '+504', label: 'Honduras', flag: '🇭🇳' },
  { code: '+852', label: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', label: 'Hungary', flag: '🇭🇺' },
  { code: '+354', label: 'Iceland', flag: '🇮🇸' },
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+62', label: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', label: 'Iran', flag: '🇮🇷' },
  { code: '+964', label: 'Iraq', flag: '🇮🇶' },
  { code: '+353', label: 'Ireland', flag: '🇮🇪' },
  { code: '+44 1624', label: 'Isle of Man', flag: '🇮🇲' },
  { code: '+972', label: 'Israel', flag: '🇮🇱' },
  { code: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: '+225', label: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1 876', label: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+44 1534', label: 'Jersey', flag: '🇯🇪' },
  { code: '+962', label: 'Jordan', flag: '🇯🇴' },
  { code: '+7', label: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', label: 'Kenya', flag: '🇰🇪' },
  { code: '+686', label: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', label: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', label: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', label: 'Laos', flag: '🇱🇦' },
  { code: '+371', label: 'Latvia', flag: '🇱🇻' },
  { code: '+961', label: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', label: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', label: 'Liberia', flag: '🇱🇷' },
  { code: '+218', label: 'Libya', flag: '🇱🇾' },
  { code: '+423', label: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', label: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', label: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', label: 'Macau', flag: '🇲🇴' },
  { code: '+389', label: 'Macedonia', flag: '🇲🇰' },
  { code: '+261', label: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', label: 'Malawi', flag: '🇲🇼' },
  { code: '+60', label: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', label: 'Maldives', flag: '🇲🇻' },
  { code: '+223', label: 'Mali', flag: '🇲🇱' },
  { code: '+356', label: 'Malta', flag: '🇲🇹' },
  { code: '+692', label: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+222', label: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', label: 'Mauritius', flag: '🇲🇺' },
  { code: '+262', label: 'Mayotte', flag: '🇾🇹' },
  { code: '+52', label: 'Mexico', flag: '🇲🇽' },
  { code: '+691', label: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', label: 'Moldova', flag: '🇲🇩' },
  { code: '+377', label: 'Monaco', flag: '🇲🇨' },
  { code: '+976', label: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', label: 'Montenegro', flag: '🇲🇪' },
  { code: '+1 664', label: 'Montserrat', flag: '🇲🇸' },
  { code: '+212', label: 'Morocco', flag: '🇲🇦' },
  { code: '+258', label: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', label: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', label: 'Namibia', flag: '🇳🇦' },
  { code: '+674', label: 'Nauru', flag: '🇳🇷' },
  { code: '+977', label: 'Nepal', flag: '🇳🇵' },
  { code: '+31', label: 'Netherlands', flag: '🇳🇱' },
  { code: '+687', label: 'New Caledonia', flag: '🇳🇨' },
  { code: '+64', label: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', label: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', label: 'Niger', flag: '🇳🇪' },
  { code: '+234', label: 'Nigeria', flag: '🇳🇬' },
  { code: '+683', label: 'Niue', flag: '🇳🇺' },
  { code: '+850', label: 'North Korea', flag: '🇰🇵' },
  { code: '+1 670', label: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: '+47', label: 'Norway', flag: '🇳🇴' },
  { code: '+968', label: 'Oman', flag: '🇴🇲' },
  { code: '+92', label: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', label: 'Palau', flag: '🇵🇼' },
  { code: '+970', label: 'Palestine', flag: '🇵🇸' },
  { code: '+507', label: 'Panama', flag: '🇵🇦' },
  { code: '+675', label: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', label: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', label: 'Peru', flag: '🇵🇪' },
  { code: '+63', label: 'Philippines', flag: '🇵🇭' },
  { code: '+48', label: 'Poland', flag: '🇵🇱' },
  { code: '+351', label: 'Portugal', flag: '🇵🇹' },
  { code: '+1 787', label: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', label: 'Qatar', flag: '🇶🇦' },
  { code: '+242', label: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+262', label: 'Réunion', flag: '🇷🇪' },
  { code: '+40', label: 'Romania', flag: '🇷🇴' },
  { code: '+7', label: 'Russia', flag: '🇷🇺' },
  { code: '+250', label: 'Rwanda', flag: '🇷🇼' },
  { code: '+590', label: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: '+290', label: 'Saint Helena', flag: '🇸🇭' },
  { code: '+1 869', label: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1 758', label: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+590', label: 'Saint Martin', flag: '🇲🇫' },
  { code: '+508', label: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+1 784', label: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', label: 'Samoa', flag: '🇼🇸' },
  { code: '+378', label: 'San Marino', flag: '🇸🇲' },
  { code: '+239', label: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', label: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', label: 'Senegal', flag: '🇸🇳' },
  { code: '+381', label: 'Serbia', flag: '🇷🇸' },
  { code: '+248', label: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', label: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', label: 'Singapore', flag: '🇸🇬' },
  { code: '+1 721', label: 'Sint Maarten', flag: '🇸🇽' },
  { code: '+421', label: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', label: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', label: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', label: 'Somalia', flag: '🇸🇴' },
  { code: '+27', label: 'South Africa', flag: '🇿🇦' },
  { code: '+82', label: 'South Korea', flag: '🇰🇷' },
  { code: '+211', label: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: '+94', label: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', label: 'Sudan', flag: '🇸🇩' },
  { code: '+597', label: 'Suriname', flag: '🇸🇷' },
  { code: '+268', label: 'Swaziland', flag: '🇸🇿' },
  { code: '+46', label: 'Sweden', flag: '🇸🇪' },
  { code: '+41', label: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', label: 'Syria', flag: '🇸🇾' },
  { code: '+886', label: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', label: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', label: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', label: 'Thailand', flag: '🇹🇭' },
  { code: '+228', label: 'Togo', flag: '🇹🇬' },
  { code: '+690', label: 'Tokelau', flag: '🇹🇰' },
  { code: '+676', label: 'Tonga', flag: '🇹🇴' },
  { code: '+1 868', label: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', label: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', label: 'Turkey', flag: '🇹🇷' },
  { code: '+993', label: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+1 649', label: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: '+688', label: 'Tuvalu', flag: '🇹🇻' },
  { code: '+1 340', label: 'U.S. Virgin Islands', flag: '🇻🇮' },
  { code: '+256', label: 'Uganda', flag: '🇺🇬' },
  { code: '+380', label: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', label: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', label: 'United States', flag: '🇺🇸' },
  { code: '+598', label: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', label: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', label: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', label: 'Vatican', flag: '🇻🇦' },
  { code: '+58', label: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', label: 'Vietnam', flag: '🇻🇳' },
  { code: '+681', label: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+212', label: 'Western Sahara', flag: '🇪🇭' },
  { code: '+967', label: 'Yemen', flag: '🇾🇪' },
  { code: '+260', label: 'Zambia', flag: '🇿🇲' },
  { code: '+263', label: 'Zimbabwe', flag: '🇿🇼' },
];

interface CountryCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (countryCode: CountryCode) => void;
  selectedCode?: string;
}

export function CountryCodeModal({
  visible,
  onClose,
  onSelect,
  selectedCode,
}: CountryCodeModalProps) {
  const { colors } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countryCodes.sort((a, b) => a.label.localeCompare(b.label));
    }

    const query = searchQuery.toLowerCase().trim();
    return countryCodes
      .filter(
        (country) =>
          country.label.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query)
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [searchQuery]);

  const handleSelect = (country: CountryCode) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Sélectionner un pays
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={20} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un pays ou un code..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Countries List */}
          <ScrollView
            style={styles.countriesList}
            showsVerticalScrollIndicator={false}
          >
            {filteredCountries.map((country, index) => (
              <Animated.View
                key={`${country.code}-${country.label}`}
                entering={FadeInDown.delay(index * 50)}
              >
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    {
                      backgroundColor:
                        selectedCode === country.code
                          ? colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(country)}
                >
                  <View style={styles.countryInfo}>
                    <Text style={styles.flag}>{country.flag}</Text>
                    <View style={styles.countryDetails}>
                      <Text style={[styles.countryName, { color: colors.text }]}>
                        {country.label}
                      </Text>
                      <Text style={[styles.countryCode, { color: colors.muted }]}>
                        {country.code}
                      </Text>
                    </View>
                  </View>
                  {selectedCode === country.code && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
            {filteredCountries.length === 0 && (
              <View style={styles.emptyState}>
                <Globe size={48} color={colors.muted} />
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                  Aucun pays trouvé
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
                  Essayez de modifier votre recherche
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  countriesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  countryCode: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});