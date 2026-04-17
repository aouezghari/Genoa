import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../model/auth-context';
import { useRouter } from 'expo-router';

export default function BurgerMenu() {
  const [visible, setVisible] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setVisible(false);
    await logout();
  };

  const goToProfile = () => {
    setVisible(false);
    router.push('/params'); 
  };

  return (
    <View style={{ marginRight: 15 }}>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.button}>
        <Feather name="menu" size={26} color="#1C1C1E" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={goToProfile}>
              <Feather name="user" size={20} color="#1C1C1E" />
              <Text style={styles.menuText}>Infos personnelles</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuCard: {
    marginTop: 100, 
    marginRight: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 200,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 15,
  }
});