import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { VoiceInput } from './VoiceInput';

interface VoiceEnabledInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  colors: any;
  icon?: React.ReactNode;
}

export function VoiceEnabledInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  style,
  colors,
  icon,
}: VoiceEnabledInputProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.inputContainer}>
        {icon}
        <TextInput
          style={[styles.input, style, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      <VoiceInput onTextChange={onChangeText} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
});