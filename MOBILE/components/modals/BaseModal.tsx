import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/theme';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ visible, onClose, children }: BaseModalProps) {
  const { colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <View style={[
          styles.content,
          { backgroundColor: colors.card }
        ]}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: colors.border }
            ]}
            onPress={onClose}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    borderRadius: 16,
    width: '95%',
    maxWidth: 800,
    maxHeight: '90%',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});