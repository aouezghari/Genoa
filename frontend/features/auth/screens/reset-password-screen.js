import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '../services/auth-api';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams(); 
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  const showFeedback = (type, title, message) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const closeFeedback = () => {
    setFeedbackVisible(false);
    if (feedbackType === 'success') {
      router.replace('/(auth)/login');
    }
  };

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      showFeedback('error', 'Échec de la réinitialisation', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      showFeedback('error', 'Échec de la réinitialisation', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, password);
      
      if (response.status) {
        showFeedback('success', 'Mot de passe mis à jour', 'Votre mot de passe a été modifié avec succès.');
      } else {
        showFeedback('error', 'Échec de la réinitialisation', response.message || 'Lien invalide ou expiré.');
      }
    } catch (err) {
      showFeedback('error', 'Échec de la réinitialisation', err?.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>Créez un mot de passe robuste pour sécuriser votre compte.</Text>
        </View>

        <PasswordInput 
          placeholder="Nouveau mot de passe" 
          value={password} 
          onChangeText={setPassword} 
          preventPaste={false} 
        />
        
        <PasswordStrengthMeter password={password} />

        <PasswordInput 
          placeholder="Confirmez le mot de passe" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          preventPaste={true} 
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={feedbackVisible}
        onRequestClose={closeFeedback}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={feedbackType === 'success' ? styles.modalIconSuccess : styles.modalIconError}>
              <Text style={styles.modalIconText}>{feedbackType === 'success' ? '✓' : '!'}</Text>
            </View>
            <Text style={styles.modalTitle}>{feedbackTitle}</Text>
            <Text style={styles.modalMessage}>{feedbackMessage}</Text>

            <TouchableOpacity
              style={feedbackType === 'success' ? styles.modalButtonSuccess : styles.modalButtonError}
              onPress={closeFeedback}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#8ad39d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalIconSuccess: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconError: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE4E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButtonSuccess: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonError: {
    width: '100%',
    backgroundColor: '#D92D20',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});