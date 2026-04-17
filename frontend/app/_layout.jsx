import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../features/auth/model/auth-context';

export const unstable_settings = {
  initialRouteName: '(auth)/login',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const rootGroup = segments[0]; 

    if (!user) {
      if (rootGroup !== '(auth)') {
        router.replace('/(auth)/login');
      }
    } 
    else if (user && !user.isValidated) {
      if (rootGroup !== 'pending') {
        router.replace('/pending');
      }
    } 
    else if (user && user.isValidated) {
      
      if (rootGroup === '(tabs)' && segments[1] === 'advanced' && !user.isAdmin) {
        router.replace('/(tabs)');
      }
      else if (rootGroup === '(tabs)' && segments[1] === 'admin-tree' && !user.isAdmin) {
        router.replace('/(tabs)');
      }
      else if (rootGroup === '(auth)' || rootGroup === 'pending') {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pending" />
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}