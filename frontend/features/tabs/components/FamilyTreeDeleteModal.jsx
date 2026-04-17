import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { familyTreeStyles as s } from '../styles/FamilyTreeScreen.styles';

export default function FamilyTreeDeleteModal({
  visible,
  selected,
  onClose,
  onConfirm,
  blocked = false,
  blockedMessage = '',
}) {
  const fullName = [selected?.firstName, selected?.lastName].filter(Boolean).join(' ').trim() || selected?.name || 'Ce noeud';

  return (
    <Modal visible={visible && !!selected} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <Pressable style={s.actionCard} onPress={e => e.stopPropagation()}>
          <Text style={s.actionTitle}>{blocked ? 'Suppression impossible' : 'Supprimer ?'}</Text>
          <Text style={s.actionSub}>
            {blocked ? `${fullName} ne peut pas etre supprime.` : `${fullName} sera supprime.`}
          </Text>
          <Text style={s.deleteWarn}>
            {blocked ? blockedMessage : 'Toute la branche sera supprimee.'}
          </Text>

          {!blocked && (
            <TouchableOpacity style={s.actionBtnDanger} onPress={onConfirm}>
              <Text style={s.actionBtnDangerTxt}>Oui, supprimer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.actionBtn} onPress={onClose}>
            <Text style={s.actionBtnTxt}>{blocked ? 'Fermer' : 'Annuler'}</Text>
          </TouchableOpacity>
        </Pressable>
      </View>
    </Modal>
  );
}
