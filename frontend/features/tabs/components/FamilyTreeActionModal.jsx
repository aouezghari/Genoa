import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { familyTreeStyles as s } from '../styles/FamilyTreeScreen.styles';

export default function FamilyTreeActionModal({
  visible,
  selected,
  isRoot,
  canEdit = true,
  isDeleteBlocked = false,
  deleteBlockedReason = '',
  onClose,
  onAdd,
  onInfo,
  onEdit,
  onDelete,
  onClearSelection,
  onViewTree, 
}) {
  const fullName = selected
    ? [selected.firstName, selected.lastName].filter(Boolean).join(' ').trim() || selected.name
    : '';
  const addDisabled = !canEdit;
  const editDisabled = !canEdit;
  const deleteDisabled = !canEdit || isRoot || isDeleteBlocked;

  return (
    <Modal visible={visible && !!selected} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <Pressable style={s.actionCard} onPress={e => e.stopPropagation()}>
          <Text style={s.actionTitle}>Actions</Text>
          <Text style={s.actionSub}>{fullName}</Text>

          {selected?._isSpouseCard && (
            <TouchableOpacity style={[s.actionBtn, { borderColor: '#4F46E5', borderWidth: 1 }]} onPress={onViewTree}>
              <View style={s.actionBtnRow}>
                <Feather name="users" size={16} color="#4F46E5" style={s.actionBtnIcon} />
                <Text style={[s.actionBtnTxt, { color: '#4F46E5', fontWeight: 'bold' }]}>Voir sa famille</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[s.actionBtnPrimary, addDisabled && s.actionBtnPrimaryDisabled]}
            disabled={addDisabled}
            activeOpacity={addDisabled ? 1 : 0.7}
            onPress={onAdd}
          >
            <View style={s.actionBtnRow}>
              <Feather name="plus-circle" size={16} color={addDisabled ? '#9CA3AF' : '#FFFFFF'} style={s.actionBtnIcon} />
              <Text style={[s.actionBtnPrimaryTxt, addDisabled && s.actionBtnPrimaryTxtDisabled]}>
                {addDisabled ? 'Ajouter (lecture seule)' : 'Ajouter'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={onInfo}>
            <View style={s.actionBtnRow}>
              <Feather name="info" size={16} color="#111827" style={s.actionBtnIcon} />
              <Text style={s.actionBtnTxt}>Infos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, editDisabled && s.actionBtnDisabled]}
            disabled={editDisabled}
            activeOpacity={editDisabled ? 1 : 0.7}
            onPress={onEdit}
          >
            <View style={s.actionBtnRow}>
              <Feather name="edit-2" size={16} color={editDisabled ? '#9CA3AF' : '#111827'} style={s.actionBtnIcon} />
              <Text style={[s.actionBtnTxt, editDisabled && s.actionBtnTxtDisabled]}>
                {editDisabled ? 'Modifier (lecture seule)' : 'Modifier'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionBtnDanger}
            disabled={deleteDisabled}
            activeOpacity={deleteDisabled ? 1 : 0.7}
            onPress={onDelete}
          >
            <View style={s.actionBtnRow}>
              <Feather name="trash-2" size={16} color={deleteDisabled ? '#9CA3AF' : '#FFFFFF'} style={s.actionBtnIcon} />
              <Text style={[s.actionBtnDangerTxt, deleteDisabled && s.actionBtnDangerTxtDisabled]}>
                {!canEdit ? 'Supprimer (lecture seule)' : isRoot ? 'Racine verrouillee' : isDeleteBlocked ? 'Suppression bloquee' : 'Supprimer'}
              </Text>
            </View>
          </TouchableOpacity>

          {isDeleteBlocked && !!deleteBlockedReason && (
            <Text style={s.deleteWarn}>{deleteBlockedReason}</Text>
          )}

          <TouchableOpacity style={s.actionCancel} onPress={onClearSelection}>
            <Text style={s.actionCancelTxt}>Fermer</Text>
          </TouchableOpacity>
        </Pressable>
      </View>
    </Modal>
  );
}