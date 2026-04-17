import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../services/auth-api'; 

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setMessage('Veuillez entrer votre email.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.status) {
        setMessage('Un email vous a été envoyé si ce compte existe.');
      } else {
        setMessage(response.message || "Erreur lors de l'envoi de l'email.");
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation.</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Votre adresse email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {message ? (
          <Text style={[styles.message, message.includes('Erreur') || message.includes('Veuillez') ? styles.error : styles.success]}>
            {message}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleReset} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer le lien</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 22 },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#80BFFF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  backText: { color: '#666', fontSize: 15, fontWeight: '600' },
  message: { marginBottom: 15, textAlign: 'center', fontSize: 14 },
  error: { color: 'red' },
  success: { color: 'green' },
});