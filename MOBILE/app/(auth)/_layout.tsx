import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/theme';
// import { usePublicRoute } from '@/hooks/usePublicRoute';

export default function AuthLayout() {
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
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
      <Stack.Screen name="upload-documents" options={{ title: 'Upload Documents' }} />
      <Stack.Screen name="confirmation" options={{ title: 'Confirmation' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
    </Stack>
  );
}