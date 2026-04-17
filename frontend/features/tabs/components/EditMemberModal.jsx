import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Pressable, useWindowDimensions,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { editMemberModalStyles as s } from '../styles/EditMemberModal.styles';

export default function EditMemberModal({ visible, onClose, onSave, member }) {
  const { width, height } = useWindowDimensions();
  const isDesktopLike = width >= 900;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [professions, setProfessions] = useState('');
  const [addresses, setAddresses] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!visible || !member) return;
    setFirstName(member.firstName || '');
    setLastName(member.lastName || '');
    setEmail(member.email || '');
    setGender(member.gender || null);
    setBirthDate(member.birthDate || '');
    setDeathDate(member.deathDate || '');
    setProfessions(member.professions || '');
    setAddresses(member.addresses || '');
    setPhone(member.phone || '');
  }, [visible, member]);

  const submit = () => {
    const normalizedEmail = email.trim();
    if (!firstName.trim() || !lastName.trim() || !normalizedEmail || !gender) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      gender,
      birthDate: birthDate.trim(),
      deathDate: deathDate.trim(),
      professions: professions.trim(),
      addresses: addresses.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          style={[s.kav, isDesktopLike && s.kavDesktop]}
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <Pressable
            style={[
              s.sheet,
              isDesktopLike
                ? {
                    width: Math.min(760, width - 40),
                    maxHeight: Math.min(Math.floor(height * 0.86), 760),
                    borderRadius: 24,
                  }
                : null,
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View style={s.handle} />

            <ScrollView
              style={s.formScroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.formContent}
            >
              <View style={s.titleRow}>
                <Feather name="edit-2" size={16} color="#111827" />
                <Text style={s.sheetTitle}>Modifier</Text>
              </View>

              <Text style={s.fieldLabel}>Prenom *</Text>
              <TextInput
                style={s.input}
                placeholder="ex : Sophie"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={s.fieldLabel}>Nom *</Text>
              <TextInput
                style={s.input}
                placeholder="ex : Martin"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
              />

              <Text style={s.fieldLabel}>E-mail *</Text>
              <TextInput
                style={s.input}
                placeholder="ex : sophie@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={s.fieldLabel}>Genre *</Text>
              <View style={s.gRow}>
                {[
                  { k: 'male', icon: 'male', label: 'Homme', color: '#2563EB' },
                  { k: 'female', icon: 'female', label: 'Femme', color: '#DB2777' },
                ].map(g => (
                  <TouchableOpacity
                    key={g.k}
                    style={[s.gPill, gender === g.k && { borderColor: g.color, backgroundColor: g.color + '18' }]}
                    onPress={() => setGender(g.k)}
                  >
                    <FontAwesome5 name={g.icon} size={15} color={gender === g.k ? g.color : '#94A3B8'} style={s.gIcon} />
                    <Text style={[s.gLabel, gender === g.k && { color: g.color, fontWeight: '700' }]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>Date de naissance</Text>
              <TextInput
                style={s.input}
                placeholder="ex : 1990-04-25"
                placeholderTextColor="#9CA3AF"
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <Text style={s.fieldLabel}>Date de deces</Text>
              <TextInput
                style={s.input}
                placeholder="ex : 2070-11-03"
                placeholderTextColor="#9CA3AF"
                value={deathDate}
                onChangeText={setDeathDate}
              />

              <Text style={s.fieldLabel}>Profession(s)</Text>
              <TextInput
                style={s.input}
                placeholder="ex : Enseignante, ecrivaine"
                placeholderTextColor="#9CA3AF"
                value={professions}
                onChangeText={setProfessions}
              />

              <Text style={s.fieldLabel}>Adresse(s)</Text>
              <TextInput
                style={s.input}
                placeholder="ex : 10 rue des Fleurs, Paris"
                placeholderTextColor="#9CA3AF"
                value={addresses}
                onChangeText={setAddresses}
              />

              <Text style={s.fieldLabel}>Telephone</Text>
              <TextInput
                style={s.input}
                placeholder="ex : +33 6 12 34 56 78"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[s.saveBtn, (!firstName.trim() || !lastName.trim() || !email.trim() || !gender) && { opacity: 0.45 }]}
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !gender}
                onPress={submit}
              >
                <View style={s.ctaRow}>
                  <Feather name="save" size={15} color="#FFFFFF" style={s.ctaIcon} />
                  <Text style={s.saveTxt}>Sauvegarder</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelTxt}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

