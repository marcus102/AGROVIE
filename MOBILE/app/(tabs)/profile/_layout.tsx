import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/theme';

export default function ProfileLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'Profil',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Modifier le profil',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="dashboard/admin"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Tableau de bord administrateur',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="dashboard/entrepreneur"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Tableau de bord entrepreneur',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="dashboard/technician"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Tableau de bord technicien',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="dashboard/worker"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Tableau de bord travaileur',
          headerStyle: {
            backgroundColor: colors.card,
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
