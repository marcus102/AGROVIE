import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/theme';

export default function ConseilsLayout() {
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
          title: 'Conseils Agricoles',
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
        name="[id]"
        options={{
          headerShown: false,
          headerTitle: '',
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
