import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Star,
  ChevronRight,
  Clock,
  CreditCard,
} from 'lucide-react-native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

interface ListItemProps {
  item: {
    id: string;
    mission_images: string[];
    mission_title: string;
    needed_actor: string;
    needed_actor_amount: string;
    location: string;
    start_date: string;
    final_price: string;
    end_date: string;
    status: string;
    required_experience_level: string;
  };
  index: number;
  onPress: () => void;
  colors: {
    card: string;
    text: string;
    muted: string;
    primary: string;
    border: string;
  };
}

export const ListItem: React.FC<ListItemProps> = ({
  item,
  index,
  onPress,
  colors,
}) => {
  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString() + ' FCFA';
  };

  const formatDate = (date: string) => {
    const [day, month, year] = date.split('/');
    return `${day}/${month}/${parseInt(year) === 2 ? '20' + year : year}`;
  };

  const handlePaymentPress = () => {
    router.push(`/payment/${item.id}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {item.mission_images &&
        Array.isArray(item.mission_images) &&
        item.mission_images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.mission_images[0] }}
              style={styles.image}
            />
            <View
              style={[
                styles.experienceBadge,
                { backgroundColor: colors.primary + 'E6' },
              ]}
            >
              <Clock size={14} color={colors.card} />
              <Text style={[styles.experienceText, { color: colors.card }]}>
                {(() => {
                  switch (item.status) {
                    case 'in_review':
                      return 'En attente';
                    case 'accepted':
                      return 'Accepté';
                    case 'online':
                      return 'En ligne';
                    case 'completed':
                      return 'Terminé';
                    case 'removed':
                      return 'Supprimé';
                    case 'rejected':
                      return 'Rejeté';
                    default:
                      return 'Inconnu';
                  }
                })()}
              </Text>
            </View>
          </View>
        )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.mission_title}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(item.final_price)}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Star size={16} color={colors.muted} />
              <Text style={[styles.detailText, { color: colors.muted }]}>
                {item.required_experience_level}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.muted} />
              <Text
                style={[styles.detailText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={16} color={colors.muted} />
              <Text style={[styles.detailText, { color: colors.muted }]}>
                {item.needed_actor_amount} {item.needed_actor}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.muted} />
              <Text style={[styles.detailText, { color: colors.muted }]}>
                {item.start_date} - {item.end_date}
              </Text>
            </View>
          </View>
        </View>

        {item.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.primary }]}
            onPress={handlePaymentPress}
          >
            <CreditCard size={16} color={colors.card} />
            <Text style={[styles.payButtonText, { color: colors.card }]}>
              Payer maintenant
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: item.status === 'accepted' ? colors.card : colors.primary,
            borderWidth: item.status === 'accepted' ? 1 : 0,
            borderColor: item.status === 'accepted' ? colors.primary : 'transparent'
          }]}
          onPress={onPress}
        >
          <Text style={[styles.buttonText, { 
            color: item.status === 'accepted' ? colors.primary : colors.card 
          }]}>
            Voir les détails
          </Text>
          <ChevronRight size={20} color={item.status === 'accepted' ? colors.primary : colors.card} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  experienceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  experienceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  details: {
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  payButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});