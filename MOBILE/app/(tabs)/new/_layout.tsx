import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/theme';

export default function JobsLayout() {
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
        name="create" 
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Créer une mission',
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