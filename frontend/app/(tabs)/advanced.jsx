import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/model/auth-context';

import AdminScreen from '../../features/auth/screens/advanced-screen'; 

export default function AdvancedRoute() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Feather name="lock" size={80} color="#FF3B30" />
          </View>
          
          <Text style={styles.title}>Accès Réservé</Text>
          
          <View style={styles.messageBox}>
            <Text style={styles.message}>
              Cette page est uniquement accessible aux <Text style={styles.bold}>Administrateurs</Text>.
            </Text>
            <Text style={styles.subMessage}>
              Votre compte actuel ne possède pas les privilèges requis.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <AdminScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  messageBox: {
    alignItems: 'center',
  },
  message: {
    fontSize: 17,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  subMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  }
});