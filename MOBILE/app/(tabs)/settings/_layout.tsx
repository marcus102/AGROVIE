import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/theme';

export default function SettingsLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: 'modal',
          title: 'Paramètres',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="password"
        options={{
          presentation: 'modal',
          title: 'Modifier le mot de passe',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="email"
        options={{
          presentation: 'modal',
          title: "Modifier l'adresse email",
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
    </Stack>
  );
}
