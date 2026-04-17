import { Tabs } from 'expo-router';
import { HapticTab } from '../../components/haptic-tab';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth } from '../../features/auth/model/auth-context';
import { Feather } from '@expo/vector-icons';

import BurgerMenu from '../../features/auth/components/burger-menu';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        
        headerShown: true, 
        headerTitle: "", 
        headerShadowVisible: false, 
        headerRight: () => <BurgerMenu />, 
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },

        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: 5,
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather size={24} name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <Feather size={24} name="bar-chart-2" color={color} />,
        }}
      />
    <Tabs.Screen
        name="params"
        options={{ 
          href: null 
        }}
      />

      <Tabs.Screen
        name="advanced"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <Feather size={24} name="shield" color={color} />,
          tabBarActiveTintColor: '#FF3B30',
          href: user?.isAdmin ? '/advanced' : null,
        }}
      />

      <Tabs.Screen
        name="admin-tree/[userId]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}