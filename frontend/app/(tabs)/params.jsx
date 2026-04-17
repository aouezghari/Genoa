import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/model/auth-context';
import { authApi } from '../../features/auth/services/auth-api';
import PasswordInput from '../../features/auth/components/PasswordInput';
import PasswordStrengthMeter from '../../features/auth/components/PasswordStrengthMeter';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.labelContainer}>
      <Feather name={icon} size={18} color="#8E8E93" />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value || 'Non renseigné'}</Text>
  </View>
);

export default function ProfileScreen() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Succès');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordErrorModalVisible, setPasswordErrorModalVisible] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('Le changement du mot de passe a échoué.');

  const showSuccessModal = (title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessModalVisible(true);
  };

  const showPasswordErrorModal = (message) => {
    setPasswordErrorMessage(message || 'Le changement du mot de passe a échoué.');
    setPasswordErrorModalVisible(true);
  };

  const hydrateProfileForm = (details) => {
    if (!details) return;
    setFirstName(details.firstName || '');
    setLastName(details.lastName || '');
    setDateOfBirth(details.dateOfBirth ? new Date(details.dateOfBirth).toISOString().slice(0, 10) : '');
    setProfession(details.profession || '');
    setAddress(details.contacts?.addresses?.[0] || '');
    setPhoneNumber(details.contacts?.phoneNumbers?.[0] || '');
  };

  useEffect(() => {
    const loadFullDetails = async () => {
      try {
        const fullData = await authApi.getUserDetails();
        setUser(fullData);
        hydrateProfileForm(fullData);
      } catch (error) {
        console.error("Erreur lors du chargement des détails :", error);
        setUser(authUser);
        hydrateProfileForm(authUser);
      } finally {
        setLoading(false);
      }
    };

    loadFullDetails();
  }, [authUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }

    try {
      setSavingProfile(true);
      const response = await authApi.updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        profession: profession.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      if (response.status) {
        setUser(response.user);
        hydrateProfileForm(response.user);
        showSuccessModal('Profil mis à jour', 'Vos informations de profil ont été enregistrées avec succès.');
      }
    } catch (error) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showPasswordErrorModal('Tous les champs mot de passe sont obligatoires.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showPasswordErrorModal('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    try {
      setSavingPassword(true);
      const response = await authApi.changePassword(currentPassword, newPassword);
      if (response.status) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showSuccessModal('Mot de passe changé', 'Votre mot de passe a été mis à jour avec succès.');
      }
    } catch (error) {
      showPasswordErrorModal(error?.response?.data?.message || 'Impossible de changer le mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {user.firstName?.charAt(0).toUpperCase()}
            {user.lastName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.userRole}>
          {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Contact</Text>
      <View style={styles.card}>
        <InfoRow icon="mail" label="Email" value={user.email} />
        <View style={styles.divider} />
        <InfoRow 
          icon="phone" 
          label="Téléphone" 
          value={user.contacts?.phoneNumbers?.[0]} 
        />
      </View>

      <Text style={styles.sectionTitle}>Modifier le profil</Text>
      <View style={styles.cardForm}>
        <Text style={styles.inputLabel}>Prénom *</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.inputLabel}>Nom *</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.inputLabel}>Email (lecture seule)</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={user.email || ''} editable={false} />

        <Text style={styles.inputLabel}>Genre (lecture seule)</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={user.gender || ''} editable={false} />

        <Text style={styles.inputLabel}>Date de naissance (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="1990-04-25" />

        <Text style={styles.inputLabel}>Profession</Text>
        <TextInput style={styles.input} value={profession} onChangeText={setProfession} />

        <Text style={styles.inputLabel}>Adresse</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.inputLabel}>Téléphone</Text>
        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

        <TouchableOpacity style={[styles.button, savingProfile && styles.buttonDisabled]} disabled={savingProfile} onPress={handleSaveProfile}>
          {savingProfile ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enregistrer le profil</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Détails personnels</Text>
      <View style={styles.card}>
        <InfoRow icon="calendar" label="Date de naissance" value={formatDate(user.dateOfBirth)} />
        <View style={styles.divider} />
        <InfoRow icon="user" label="Genre" value={user.gender} />
        <View style={styles.divider} />
        <InfoRow icon="briefcase" label="Profession" value={user.profession} />
        <View style={styles.divider} />
        <InfoRow 
          icon="map-pin" 
          label="Adresse" 
          value={user.contacts?.addresses?.[0]} 
        />
      </View>

      <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
      <View style={styles.cardForm}>
        <Text style={styles.inputLabel}>Mot de passe actuel *</Text>
        <PasswordInput
          placeholder="Mot de passe actuel *"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          preventPaste={false}
        />

        <Text style={styles.inputLabel}>Nouveau mot de passe *</Text>
        <PasswordInput
          placeholder="Nouveau mot de passe *"
          value={newPassword}
          onChangeText={setNewPassword}
          preventPaste={false}
        />
        <PasswordStrengthMeter password={newPassword} />

        <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe *</Text>
        <PasswordInput
          placeholder="Confirmer le nouveau mot de passe *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          preventPaste={true}
        />

        <TouchableOpacity style={[styles.button, savingPassword && styles.buttonDisabled]} disabled={savingPassword} onPress={handleChangePassword}>
          {savingPassword ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Changer le mot de passe</Text>}
        </TouchableOpacity>
      </View>

      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrapper}>
              <Feather name="check" size={24} color="#0A7A3E" />
            </View>
            <Text style={styles.modalTitle}>{successTitle}</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={passwordErrorModalVisible}
        onRequestClose={() => setPasswordErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrapperError}>
              <Feather name="x" size={24} color="#B42318" />
            </View>
            <Text style={styles.modalTitle}>Échec du changement</Text>
            <Text style={styles.modalMessage}>{passwordErrorMessage}</Text>
            <TouchableOpacity style={styles.modalButtonError} onPress={() => setPasswordErrorModalVisible(false)}>
              <Text style={styles.modalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitials: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  userRole: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginLeft: 10, marginBottom: 8, marginTop: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 4, marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  labelText: { fontSize: 16, color: '#1C1C1E' },
  valueText: { fontSize: 16, color: '#8E8E93', maxWidth: '50%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 44 },
  cardForm: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 15 },
  inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6, marginTop: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  button: {
    marginTop: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
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
  modalIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconWrapperError: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE4E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButton: {
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