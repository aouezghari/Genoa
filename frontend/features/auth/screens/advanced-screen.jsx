import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authApi } from '../services/auth-api';

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ visible: false, user: null });
  const [treeRoleModal, setTreeRoleModal] = useState({ visible: false, user: null, nextRole: null });
  const [deleteModal, setDeleteModal] = useState({ visible: false, user: null });

  const fetchUsers = async () => {
    try {
      const data = await authApi.getAllUsersWithTreeRole();
      setUsers(data);
    } catch (error) {
      console.error("Erreur fetchUsers :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleValidate = async (userId) => {
    try {
      const res = await authApi.validateUser(userId);
      if (res.status) fetchUsers();
    } catch (error) {
      console.error("Erreur Validation :", error);
    }
  };

  const openAdminConfirm = (user) => {
    setConfirmModal({ visible: true, user: user });
  };

  const executeMakeAdmin = async () => {
    if (!confirmModal.user) return;
    
    try {
      const res = await authApi.makeAdmin(confirmModal.user._id);
      if (res.status) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Erreur MakeAdmin :", error);
    } finally {
      setConfirmModal({ visible: false, user: null });
    }
  };

  const openTreeRoleConfirm = (user, nextRole) => {
    setTreeRoleModal({ visible: true, user, nextRole });
  };

  const executeTreeRoleChange = async () => {
    if (!treeRoleModal.user || !treeRoleModal.nextRole) return;

    try {
      const res = await authApi.updateTreeRole(treeRoleModal.user._id, treeRoleModal.nextRole);
      if (res.status) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Erreur updateTreeRole :", error);
    } finally {
      setTreeRoleModal({ visible: false, user: null, nextRole: null });
    }
  };

  const openDeleteConfirm = (user) => {
    setDeleteModal({ visible: true, user });
  };

  const executeDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      const res = await authApi.deleteUser(deleteModal.user._id);
      if (res.status) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Erreur deleteUser :", error);
    } finally {
      setDeleteModal({ visible: false, user: null });
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userSubText}>
          Né(e) le : {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : '—'}
        </Text>
        <Text style={styles.userSubText}>
          Arbre : {item.treeName || 'Aucun arbre'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statusRow}>
        <View style={[styles.badge, item.isValidated ? styles.badgeValid : styles.badgePending]}>
          <Feather name={item.isValidated ? "check-circle" : "alert-circle"} size={14} color="#FFF" />
          <Text style={styles.badgeText}>
            {item.isValidated ? "Compte Validé" : "Compte non validé"}
          </Text>
        </View>

        {!item.isValidated && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnValidate]} 
            onPress={() => handleValidate(item._id)}
          >
            <Text style={styles.btnTextValidate}>Valider</Text>
            <Feather name="chevron-right" size={14} color="#248A3D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statusRow, { marginTop: 12 }]}>
        <View style={[styles.badge, item.isAdmin ? styles.badgeAdmin : styles.badgeUser]}>
          <Feather name={item.isAdmin ? "shield" : "user"} size={14} color="#FFF" />
          <Text style={styles.badgeText}>
            {item.isAdmin ? "Administrateur" : "Utilisateur"}
          </Text>
        </View>

        {!item.isAdmin && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnAdmin]} 
            onPress={() => openAdminConfirm(item)} 
          >
            <Text style={styles.btnTextAdmin}>Rendre Admin</Text>
            <Feather name="chevron-right" size={14} color="#0056B3" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statusRow, { marginTop: 12 }]}>
        <View style={[
          styles.badge,
          item.treeRole === 'editor'
            ? styles.badgeTreeEditor
            : item.treeRole === 'reader'
              ? styles.badgeTreeReader
              : styles.badgeNoTree,
        ]}>
          <Feather
            name={item.treeRole ? 'git-branch' : 'slash'}
            size={14}
            color="#FFF"
          />
          <Text style={styles.badgeText}>
            {item.treeRole === 'editor'
              ? 'Role arbre: Editeur'
              : item.treeRole === 'reader'
                ? 'Role arbre: Lecteur'
                : 'Pas dans un arbre'}
          </Text>
        </View>

        {item.treeRole && (
          <TouchableOpacity
            style={[styles.actionButton, styles.btnTreeRole]}
            onPress={() => openTreeRoleConfirm(item, item.treeRole === 'editor' ? 'reader' : 'editor')}
          >
            <Text style={styles.btnTextTreeRole}>
              Passer {item.treeRole === 'editor' ? 'Lecteur' : 'Editeur'}
            </Text>
            <Feather name="refresh-cw" size={14} color="#7A4D00" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statusRow, { marginTop: 12 }]}>
        <View style={[styles.badge, styles.badgeTreeNav]}>
          <Feather name="eye" size={14} color="#FFF" />
          <Text style={styles.badgeText}>Vue admin de l&apos;arbre</Text>
        </View>

        {item.treeRole && (
          <TouchableOpacity
            style={[styles.actionButton, styles.btnTreeNav]}
            onPress={() => router.push(`/(tabs)/admin-tree/${item._id}?name=${encodeURIComponent(`${item.firstName || ''} ${item.lastName || ''}`.trim())}`)}
          >
            <Text style={styles.btnTextTreeNav}>Voir l&apos;arbre</Text>
            <Feather name="arrow-right-circle" size={14} color="#1D4ED8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statusRow, { marginTop: 12 }]}>
        <View style={[styles.badge, styles.badgeDangerHint]}>
          <Feather name="trash-2" size={14} color="#FFF" />
          <Text style={styles.badgeText}>Suppression compte</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.btnDelete]}
          onPress={() => openDeleteConfirm(item)}
        >
          <Text style={styles.btnTextDelete}>Supprimer</Text>
          <Feather name="chevron-right" size={14} color="#991B1B" />
        </TouchableOpacity>
      </View>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Membres</Text>
        <Text style={styles.headerSub}>{users.length} utilisateurs enregistrés</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchUsers();
        }}
      />

      <Modal
        visible={confirmModal.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="alert-triangle" size={32} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Confirmation requise</Text>
            <Text style={styles.modalText}>
              Voulez-vous vraiment donner les droits d&apos;administrateur à <Text style={{fontWeight: 'bold'}}>{confirmModal.user?.firstName} {confirmModal.user?.lastName}</Text> ? Cette action est définitive.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setConfirmModal({ visible: false, user: null })}
              >
                <Text style={styles.modalBtnTextCancel}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={executeMakeAdmin}
              >
                <Text style={styles.modalBtnTextConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={treeRoleModal.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="git-branch" size={32} color="#B26A00" />
            </View>
            <Text style={styles.modalTitle}>Changer le role arbre</Text>
            <Text style={styles.modalText}>
              Voulez-vous passer <Text style={{ fontWeight: 'bold' }}>{treeRoleModal.user?.firstName} {treeRoleModal.user?.lastName}</Text>
              {' '}en{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {treeRoleModal.nextRole === 'editor' ? 'Editeur' : 'Lecteur'}
              </Text>
              ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setTreeRoleModal({ visible: false, user: null, nextRole: null })}
              >
                <Text style={styles.modalBtnTextCancel}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={executeTreeRoleChange}
              >
                <Text style={styles.modalBtnTextConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModal.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="trash-2" size={32} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Supprimer ce compte ?</Text>
            <Text style={styles.modalText}>
              Voulez-vous vraiment supprimer <Text style={{ fontWeight: 'bold' }}>{deleteModal.user?.firstName} {deleteModal.user?.lastName}</Text> ?
              Cette action retire aussi l&apos;utilisateur des collaborateurs de son arbre.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setDeleteModal({ visible: false, user: null })}
              >
                <Text style={styles.modalBtnTextCancel}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDelete]}
                onPress={executeDeleteUser}
              >
                <Text style={styles.modalBtnTextConfirm}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  badgeValid: { backgroundColor: '#34C759' },
  badgePending: { backgroundColor: '#FF9500' },
  badgeAdmin: { backgroundColor: '#007AFF' },
  badgeUser: { backgroundColor: '#8E8E93' },
  badgeTreeEditor: { backgroundColor: '#0EA5A4' },
  badgeTreeReader: { backgroundColor: '#6D28D9' },
  badgeNoTree: { backgroundColor: '#6B7280' },
  badgeDangerHint: { backgroundColor: '#B91C1C' },
  badgeTreeNav: { backgroundColor: '#2563EB' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  btnValidate: {
    backgroundColor: '#EBF7ED',
  },
  btnAdmin: {
    backgroundColor: '#E8F2FE',
  },
  btnTreeRole: {
    backgroundColor: '#FFF3DB',
  },
  btnTreeNav: {
    backgroundColor: '#DBEAFE',
  },
  btnDelete: {
    backgroundColor: '#FEE2E2',
  },
  btnTextValidate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#248A3D',
  },
  btnTextAdmin: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0056B3',
  },
  btnTextTreeRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A4D00',
  },
  btnTextTreeNav: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  btnTextDelete: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F2F2F7',
  },
  modalBtnConfirm: {
    backgroundColor: '#007AFF',
  },
  modalBtnDelete: {
    backgroundColor: '#DC2626',
  },
  modalBtnTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalBtnTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  }
});