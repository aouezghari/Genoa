import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Pressable, useWindowDimensions,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { addMemberModalStyles as s } from '../styles/AddMemberModal.styles';

const RELATIONS = [
  { key: 'child', icon: 'user-plus', label: 'Enfant' },
  { key: 'parent', icon: 'arrow-up', label: 'Parent' },
  { key: 'sibling', icon: 'users', label: 'Fratrie' },
  { key: 'spouse', icon: 'link-2', label: 'Conjoint' },
];

export default function AddMemberSheet({
  visible, onClose, onAdd, targetName = '',
  disableSibling = false, disableSpouse = false, disableParent = false,
}) {
  const { width, height } = useWindowDimensions();
  const isDesktopLike = width >= 900;

  const [step, setStep] = useState('relation');
  const [relation, setRelation] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [professions, setProfessions] = useState('');
  const [addresses, setAddresses] = useState('');
  const [phone, setPhone] = useState('');

  const reset = () => {
    setStep('relation'); setRelation(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setGender(null);
    setBirthDate('');
    setDeathDate('');
    setProfessions('');
    setAddresses('');
    setPhone('');
  };
  const close = () => { reset(); onClose(); };

  const isOff = (key) =>
    (key === 'sibling' && disableSibling) ||
    (key === 'spouse'  && disableSpouse)  ||
    (key === 'parent'  && disableParent);

  const submit = () => {
    const normalizedEmail = email.trim();
    if (!firstName.trim() || !lastName.trim() || !normalizedEmail || !gender) return;
    onAdd({
      relation,
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
    close();
  };

  const addLabel = {
    child: 'un enfant', parent: 'un parent',
    sibling: 'un frère / une sœur', spouse: 'un(e) conjoint(e)',
  }[relation];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={close} />
        <KeyboardAvoidingView
          style={[s.kav, isDesktopLike && s.kavDesktop]}
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <Pressable
            style={[
              s.sheet,
              step === 'relation' && s.sheetCompact,
              isDesktopLike
                ? {
                    width: Math.min(760, width - 40),
                    maxHeight: step === 'relation' ? 460 : Math.min(Math.floor(height * 0.86), 760),
                    borderRadius: 24,
                  }
                : null,
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View style={s.handle} />

            {step === 'relation' ? (
              <>
                <Text style={s.sheetTitle}>
                  Ajouter à{' '}
                  <Text style={{ color: '#4F46E5', fontWeight: '800' }}>{targetName}</Text>
                </Text>
                <Text style={s.sheetSub}>Choix du lien</Text>

                <View style={s.grid}>
                  {RELATIONS.map(r => {
                    const off = isOff(r.key);
                    return (
                      <TouchableOpacity
                        key={r.key}
                        style={[s.relCard, off && s.relOff]}
                        disabled={off}
                        onPress={() => { setRelation(r.key); setStep('form'); }}
                        activeOpacity={0.7}
                      >
                        <View style={[s.relIconWrap, off && s.relIconWrapOff]}>
                          <Feather name={r.icon} size={18} color={off ? '#CBD5E1' : '#4F46E5'} />
                        </View>
                        <Text style={[s.relLabel, off && { color: '#CBD5E1' }]}>{r.label}</Text>
                        {!!off && <Text style={s.relMuted}>Indispo</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={s.cancelBtn} onPress={close}>
                  <Text style={s.cancelTxt}>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView
                style={s.formScroll}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.formContent}
              >
                <TouchableOpacity onPress={() => setStep('relation')} style={s.back}>
                  <View style={s.backRow}>
                    <Feather name="chevron-left" size={16} color="#4F46E5" />
                    <Text style={s.backTxt}>Retour</Text>
                  </View>
                </TouchableOpacity>

                <Text style={s.sheetTitle}>Ajouter: {addLabel}</Text>

                <Text style={s.fieldLabel}>Prénom *</Text>
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
                      <Text style={[s.gLabel, gender === g.k && { color: g.color, fontWeight: '700' }]}>
                        {g.label}
                      </Text>
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

                <Text style={s.fieldLabel}>Date de décès</Text>
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
                  placeholder="ex : Enseignante, écrivaine"
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

                <Text style={s.fieldLabel}>Téléphone</Text>
                <TextInput
                  style={s.input}
                  placeholder="ex : +33 6 12 34 56 78"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={[s.addBtn, (!firstName.trim() || !lastName.trim() || !email.trim() || !gender) && { opacity: 0.45 }]}
                  disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !gender}
                  onPress={submit}
                >
                  <Text style={s.addTxt}>Ajouter</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}