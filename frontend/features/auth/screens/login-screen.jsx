import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import LoginForm from '../components/login-form';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.innerContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
          </View>

          <LoginForm />

          <View style={styles.footer}>

            <View style={styles.registerContainer}>
              <Text style={styles.text}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerText}>S&apos;inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  footer: { marginTop: 30, alignItems: 'center' },
  registerContainer: { flexDirection: 'row', alignItems: 'center' },
  text: { color: '#666', fontSize: 15 },
  registerText: { color: '#007AFF', fontSize: 15, fontWeight: 'bold' },
});