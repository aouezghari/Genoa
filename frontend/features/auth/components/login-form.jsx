import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../model/auth-context'; 

import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return setError('Veuillez remplir tous les champs.');
    }

    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (!response.status) {
        setError(response.message || 'Identifiants incorrects.');
      }
      
    } catch (err) {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Adresse email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordInput 
        placeholder="Mot de passe" 
        value={password} 
        onChangeText={setPassword} 
        preventPaste={false} 
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  input: {
    backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8,
    marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0',
  },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#80bfff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
  forgotPasswordContainer: { marginTop: 15, alignItems: 'center' },
  forgotPasswordText: { color: '#007AFF', fontSize: 14 },
});