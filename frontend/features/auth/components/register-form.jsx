import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { authApi } from '../services/auth-api';

import PasswordInput from './PasswordInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';

export default function RegisterForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'male',
    dateOfBirth: '',
    profession: '',
    address: '',
    phoneNumber: '',
    photo: null, 
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Tu as refusé l'accès à tes photos !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      
      let filename = imageUri.split('/').pop();
      if (!filename.includes('.')) {
        filename = `${filename}.jpg`; 
      }
      
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const photoData = { uri: imageUri, name: filename, type: type };
      
      console.log("📸 Photo sélectionnée par l'utilisateur :", photoData);

      setFormData({
        ...formData,
        photo: photoData
      });
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      return setError('Veuillez remplir tous les champs obligatoires.');
    }
    
    if (formData.password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(formData);
      
      if (response.status) {
        alert("Compte créé avec succès ! Connectez-vous.");
        router.replace('/(auth)/login');
      } else {
        setError(response.message || 'Erreur lors de l’inscription.');
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Photo de profil (Optionnel)</Text>
      <View style={styles.photoContainer}>
        {formData.photo ? (
          <Image source={{ uri: formData.photo.uri }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>Aucune</Text>
          </View>
        )}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>
            {formData.photo ? "Changer de photo" : "Ajouter une photo"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Informations obligatoires</Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom *"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Nom de famille *"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Adresse email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <PasswordInput 
        placeholder="Mot de passe *" 
        value={formData.password} 
        onChangeText={(text) => setFormData({ ...formData, password: text })} 
        preventPaste={false} 
      />
      <PasswordStrengthMeter password={formData.password} />

      <PasswordInput 
        placeholder="Confirmez le mot de passe *" 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        preventPaste={true} 
      />

      <View style={styles.genderContainer}>
        <TouchableOpacity 
          style={[styles.genderButton, formData.gender === 'male' && styles.genderActive]}
          onPress={() => setFormData({ ...formData, gender: 'male' })}
        >
          <Text style={formData.gender === 'male' ? styles.genderTextActive : styles.genderText}>Homme</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.genderButton, formData.gender === 'female' && styles.genderActive]}
          onPress={() => setFormData({ ...formData, gender: 'female' })}
        >
          <Text style={formData.gender === 'female' ? styles.genderTextActive : styles.genderText}>Femme</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Informations complémentaires</Text>

      <TextInput
        style={styles.input}
        placeholder="Date de naissance (ex: DD/MM/YYYY)"
        value={formData.dateOfBirth}
        onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Profession"
        value={formData.profession}
        onChangeText={(text) => setFormData({ ...formData, profession: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Adresse complète"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone"
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, marginTop: 5 },
  separator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 15 },
  input: {
    backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8,
    marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0',
  },
  photoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  profilePhoto: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  placeholderPhoto: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e0e0', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  placeholderText: { fontSize: 12, color: '#888' },
  photoButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  photoButtonText: { color: '#333', fontSize: 14 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  genderButton: {
    flex: 1, padding: 15, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, alignItems: 'center', marginHorizontal: 5,
  },
  genderActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  genderText: { color: '#666' },
  genderTextActive: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#8ad39d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
});