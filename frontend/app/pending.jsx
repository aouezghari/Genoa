import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../features/auth/model/auth-context';

export default function PendingScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icône stylée */}
        <View style={styles.iconCircle}>
          <Feather name="shield" size={80} color="#FF9500" />
        </View>

        <Text style={styles.title}>Compte en attente</Text>
        
        <View style={styles.messageBox}>
          <Text style={styles.message}>
            Votre compte n&apos;est pas encore <Text style={styles.bold}>vérifié</Text>.
          </Text>
          <Text style={styles.subMessage}>
            Un administrateur examine vos informations. Vous recevrez l&apos;accès complet à l&apos;arbre généalogique dès que votre profil sera validé.
          </Text>
        </View>

        {/* Option pour se déconnecter si on veut changer de compte */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircle: {
    width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFF4E5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 40,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 },
  messageBox: { alignItems: 'center', marginBottom: 50 },
  message: { fontSize: 18, color: '#444', textAlign: 'center', lineHeight: 26 },
  bold: { fontWeight: 'bold', color: '#FF9500' },
  subMessage: { fontSize: 15, color: '#777', textAlign: 'center', marginTop: 15, paddingHorizontal: 10 },
  logoutButton: { padding: 15 },
  logoutText: { color: '#FF3B30', fontWeight: '600', fontSize: 16 }
});