import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Mic, MicOff, Loader2 } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, withRepeat } from 'react-native-reanimated';

interface VoiceInputProps {
  onTextChange: (text: string) => void;
  language?: string;
  colors: {
    primary: string;
    error: string;
    muted: string;
    card: string;
  };
}

export function VoiceInput({ onTextChange, language = 'fr-FR', colors }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language;

        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          onTextChange(transcript);
        };

        recognitionInstance.onerror = (event) => {
          setError('Error recording audio. Please try again.');
          stopRecording();
        };

        recognitionInstance.onend = () => {
          setIsProcessing(false);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language]);

  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      setIsProcessing(true);

      if (Platform.OS === 'web') {
        if (recognition) {
          recognition.start();
        }
      } else {
        setError('Voice input is currently only supported on web');
      }
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setIsProcessing(false);
  };

  const pulseStyle = useAnimatedStyle(() => {
    if (!isRecording) return {};
    
    return {
      transform: [
        {
          scale: withRepeat(
            withSpring(1.2, {
              damping: 10,
              stiffness: 100,
            }),
            -1,
            true
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={[
          styles.button,
          { backgroundColor: isRecording ? colors.error + '20' : colors.primary + '20' },
        ]}
      >
        <Animated.View style={[styles.iconContainer, pulseStyle]}>
          {isProcessing && !isRecording ? (
            <Loader2 size={24} color={colors.primary} />
          ) : isRecording ? (
            <MicOff size={24} color={colors.error} />
          ) : (
            <Mic size={24} color={colors.primary} />
          )}
        </Animated.View>
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});