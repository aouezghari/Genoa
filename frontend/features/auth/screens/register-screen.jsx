import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import RegisterForm from '../components/register-form';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez votre arbre généalogique</Text>
          </View>

          <RegisterForm />

          <View style={styles.footer}>
            <Text style={styles.text}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#666', fontSize: 15 },
  loginText: { color: '#007AFF', fontSize: 15, fontWeight: 'bold' },
});