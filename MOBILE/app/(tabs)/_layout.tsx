import { Tabs } from 'expo-router';
import { Home, BookOpen, Plus, Settings, User } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuth } from '@/hooks/useAuth';
import { CustomTabBar } from '@/components/CustomTabBar';


export default function TabLayout() {
  const { colors } = useThemeStore();
  useAuth();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Home size={size} color={color} />,
        }}
      />
            <Tabs.Screen
        name="conseils"
        options={{
          title: 'Conseils',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'Créer',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}