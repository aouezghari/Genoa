import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

export default function PasswordInput({ value, onChangeText, placeholder, preventPaste }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef(null); 
  useEffect(() => {
    if (Platform.OS === 'web' && preventPaste && inputRef.current) {
      
      const blockAction = (e) => {
        e.preventDefault();
        return false;
      };

      inputRef.current.addEventListener('paste', blockAction);
      inputRef.current.addEventListener('copy', blockAction);
      inputRef.current.addEventListener('cut', blockAction);

      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('paste', blockAction);
          inputRef.current.removeEventListener('copy', blockAction);
          inputRef.current.removeEventListener('cut', blockAction);
        }
      };
    }
  }, [preventPaste]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        ref={inputRef} 
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        
        contextMenuHidden={preventPaste} 
        selectTextOnFocus={!preventPaste}
      />
      <TouchableOpacity 
        style={styles.eyeIcon} 
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
});