import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';

export default function NotFoundScreen() {
  const { colors } = useThemeStore();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Page introuvable',
          headerShown: false,
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Background Gradient */}
        <LinearGradient
          colors={[colors.primary + '10', colors.background, colors.primary + '05']}
          style={styles.backgroundGradient}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* 404 Animation */}
          <Animated.View 
            entering={BounceIn.delay(200)}
            style={styles.errorCodeContainer}
          >
            <Text style={[styles.errorCode, { color: colors.primary }]}>404</Text>
            <View style={[styles.errorCodeUnderline, { backgroundColor: colors.primary }]} />
          </Animated.View>

          {/* Icon */}
          <Animated.View 
            entering={FadeInUp.delay(400)}
            style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}
          >
            <Search size={64} color={colors.primary} />
          </Animated.View>

          {/* Text Content */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Page introuvable
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.actionsContainer}>
            {/* Primary Action - Go Home */}
            {/* <Link href="/" asChild>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Home size={20} color={colors.text} />
                <Text style={[styles.primaryButtonText, { color: colors.text }]}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </Link> */}

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  // Refresh the current route
                  if (Platform.OS === 'web') {
                    window.location.reload();
                  }
                }}
                activeOpacity={0.7}
              >
                <RefreshCw size={18} color={colors.text} />
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Actualiser
                </Text>
              </TouchableOpacity>

              <Link href="/" asChild>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    Retour
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>

          {/* Help Text */}
          <Animated.View entering={FadeInDown.delay(1000)} style={styles.helpContainer}>
            <Text style={[styles.helpText, { color: colors.muted }]}>
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe support.
            </Text>
          </Animated.View>
        </View>

        {/* Decorative Elements */}
        <View style={[styles.decorativeCircle1, { backgroundColor: colors.primary + '08' }]} />
        <View style={[styles.decorativeCircle2, { backgroundColor: colors.primary + '05' }]} />
        <View style={[styles.decorativeCircle3, { backgroundColor: colors.primary + '03' }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorCodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorCode: {
    fontSize: 120,
    fontFamily: 'Inter-Bold',
    fontWeight: '900',
    letterSpacing: -4,
    opacity: 0.9,
  },
  errorCodeUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginTop: -8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 6,
  },
  helpContainer: {
    alignItems: 'center',
    maxWidth: 350,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 200,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});

