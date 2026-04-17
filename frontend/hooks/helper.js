// utils/file-helper.js
import { Platform } from 'react-native';

/**
 * Prépare une image pour l'upload (FormData) de manière universelle.
 * @param {string} uri - Le lien de l'image (blob: ou file://)
 * @param {string} name - Le nom du fichier
 * @param {string} type - Le type MIME (ex: image/jpeg)
 * @returns {Promise<any>} Le format exact attendu par la plateforme actuelle
 */
export const prepareImageForUpload = async (uri, name, type) => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], name, { type: type }); 
  } 
  
  return { uri, name, type };
};