import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { familyTreeStyles as s } from '../styles/FamilyTreeScreen.styles';

export default function FamilyTreeInfoModal({ visible, selected, onClose }) {
  const fullName = selected
    ? [selected.firstName, selected.lastName].filter(Boolean).join(' ').trim() || selected.name
    : '';

  return (
    <Modal visible={visible && !!selected} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <Pressable style={s.infoCard} onPress={e => e.stopPropagation()}>
          <Text style={s.infoTitle}>Informations</Text>
          <Text style={s.infoName}>{fullName}</Text>

          <Text style={s.infoRow}>Nom: {selected?.lastName || '-'}</Text>
          <Text style={s.infoRow}>Prenom: {selected?.firstName || '-'}</Text>
          <Text style={s.infoRow}>E-mail: {selected?.email || '-'}</Text>
          <Text style={s.infoRow}>Sexe: {selected?.gender === 'female' ? 'Femme' : 'Homme'}</Text>
          <Text style={s.infoRow}>Date de naissance: {selected?.birthDate || selected?.birthYear || '-'}</Text>
          <Text style={s.infoRow}>Date de deces: {selected?.deathDate || '-'}</Text>
          <Text style={s.infoRow}>Profession(s): {selected?.professions || '-'}</Text>
          <Text style={s.infoRow}>Adresse(s): {selected?.addresses || '-'}</Text>
          <Text style={s.infoRow}>Telephone: {selected?.phone || '-'}</Text>

          <TouchableOpacity style={s.infoCloseBtn} onPress={onClose}>
            <Text style={s.infoCloseTxt}>Fermer</Text>
          </TouchableOpacity>
        </Pressable>
      </View>
    </Modal>
  );
}
