import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';
import { Download, AlertTriangle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

interface ForceUpdateScreenProps {
  storeUrl?: string;
}

export const ForceUpdateScreen: React.FC<ForceUpdateScreenProps> = ({ storeUrl }) => {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    } else {
      // Fallback a las tiendas genéricas
      const url = Platform.select({
        android: 'https://play.google.com/store', // Idealmente usar el link de la app real
        ios: 'https://apps.apple.com/app',
      });
      if (url) Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertTriangle color="#F59E0B" size={48} />
        </View>

        <Text style={styles.title}>Actualización Obligatoria</Text>
        <Text style={styles.description}>
          Para garantizar la seguridad de tus finanzas y disfrutar de las últimas mejoras tecnológicas, es necesario que actualices la aplicación.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Download color="#07090e" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Descargar Nueva Versión</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Tu versión actual ya no es compatible.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#07090e',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  footerText: {
    marginTop: 24,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
