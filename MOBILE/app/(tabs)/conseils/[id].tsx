import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createClient } from '@supabase/supabase-js';
import WebView from 'react-native-webview';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Document = {
  id: string;
  images: string[];
  title: string;
  description: string;
  reading_time: number;
  theme: string;
  tags: string[];
  created_at: string;
};

export default function ArticleScreen() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(200); // Initial height

  // Fetch document details from Supabase
  const fetchDocument = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          'id, images, title, description, reading_time, theme, tags, created_at'
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching document:', error.message);
        return;
      }

      setDocument(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading document...
        </Text>
      </View>
    );
  }

  if (!document) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Document not found.
        </Text>
      </View>
    );
  }

  // Generate HTML content with proper styling
  const generateHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 18px;
              line-height: 1.6;
              color: ${colors.text};
              background-color: transparent;
              margin: 0;
              padding: 0;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
            p {
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          ${document.description}
        </body>
      </html>
    `;
  };

  // Handle WebView height calculation
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setWebViewHeight(data.height);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Inject script to calculate content height
  const injectedJavaScript = `
    window.addEventListener('load', () => {
      const height = document.documentElement.scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
    });
    
    // Also send height when content changes (e.g., images load)
    const observer = new MutationObserver(() => {
      const height = document.documentElement.scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
    
    true;
  `;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      {document.images.length > 0 && (
        <Image source={{ uri: document.images[0] }} style={styles.coverImage} />
      )}

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.title, { color: colors.text }]}>
            {document.title}
          </Text>

          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {new Date(document.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Clock size={16} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {document.reading_time} min
              </Text>
            </View>

            <View style={styles.metaItem}>
              <BookOpen size={16} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {document.theme}
              </Text>
            </View>
          </View>

          <View style={styles.tags}>
            {document.tags.map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.description}>
            <WebView
              source={{ html: generateHtmlContent() }}
              style={{ 
                width: width - 48, // Account for padding
                height: webViewHeight,
                backgroundColor: 'transparent'
              }}
              originWhitelist={['*']}
              scalesPageToFit={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={handleWebViewMessage}
              injectedJavaScript={injectedJavaScript}
              scrollEnabled={false}
            />
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});