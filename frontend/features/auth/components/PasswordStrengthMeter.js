import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

export default function PasswordStrengthMeter({ password }) {
  const criteria = [
    { label: 'Au moins 8 caractères', isMet: password.length >= 8 },
    { label: 'Une majuscule', isMet: /[A-Z]/.test(password) },
    { label: 'Une minuscule', isMet: /[a-z]/.test(password) },
    { label: 'Un chiffre', isMet: /\d/.test(password) },
    { label: 'Un caractère spécial (@$!%*?&)', isMet: /[@$!%*?&]/.test(password) },
  ];

  const score = criteria.filter(c => c.isMet).length;

  const strengthLevels = [
    { label: 'Très faible', color: '#ff4d4d', width: '20%' }, 
    { label: 'Faible', color: '#ff944d', width: '40%' },      
    { label: 'Moyen', color: '#ffd24d', width: '60%' },       
    { label: 'Bon', color: '#8ad39d', width: '80%' },         
    { label: 'Parfait', color: '#28a745', width: '100%' },   
  ];

  const currentLevel = password.length === 0 ? null : strengthLevels[Math.max(score - 1, 0)];

  return (
    <View style={styles.container}>
      
      {currentLevel && (
        <View style={styles.barWrapper}>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: currentLevel.width, backgroundColor: currentLevel.color }]} />
          </View>
          <Text style={[styles.levelLabel, { color: currentLevel.color }]}>{currentLevel.label}</Text>
        </View>
      )}

      <View style={styles.criteriaContainer}>
        {criteria.map((item, index) => (
          <View key={index} style={styles.criterionRow}>
            <Feather 
              name={item.isMet ? "check-circle" : "x-circle"} 
              size={14} 
              color={item.isMet ? "#28a745" : "#ff4d4d"} 
            />
            <Text style={[
              styles.criterionText, 
              { color: item.isMet ? "#28a745" : "#ff4d4d" }
            ]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 15, 
    marginTop: -5,
    backgroundColor: '#f9f9f9', 
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  
  barWrapper: { marginBottom: 10 },
  barBackground: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  levelLabel: { fontSize: 12, marginTop: 4, fontWeight: 'bold', textAlign: 'right' },
  
  criteriaContainer: {
    flexDirection: 'column',
    gap: 4, 
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criterionText: {
    fontSize: 12,
    marginLeft: 6, 
  }
});