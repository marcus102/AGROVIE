import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createClient } from '@supabase/supabase-js';
import WebView from 'react-native-webview';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

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

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface ErrorState {
  hasError: boolean;
  message: string;
}

export default function ArticleScreen() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();

  // State management
  const [document, setDocument] = useState<Document | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
  });
  const [webViewHeight, setWebViewHeight] = useState(200);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Refs for cleanup
  const webViewRef = useRef<WebView>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Validate ID parameter
  const documentId = useMemo(() => {
    if (typeof id === 'string') return id;
    if (Array.isArray(id) && id.length > 0) return id[0];
    return null;
  }, [id]);

  // Memoized error handler
  const handleError = useCallback((message: string, error?: any) => {
    console.error('ArticleScreen Error:', message, error);
    if (isMountedRef.current) {
      setError({ hasError: true, message });
      setLoadingState('error');
    }
  }, []);

  // Optimized document fetching with proper error handling
  const fetchDocument = useCallback(
    async (docId: string) => {
      if (!supabase) {
        handleError('Supabase client not initialized');
        return;
      }

      setLoadingState('loading');
      setError({ hasError: false, message: '' });

      try {
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select(
            'id, images, title, description, reading_time, theme, tags, created_at'
          )
          .eq('id', docId)
          .single();

        if (!isMountedRef.current) return;

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            handleError('Document not found');
          } else {
            handleError(`Failed to fetch document: ${fetchError.message}`);
          }
          return;
        }

        if (!data) {
          handleError('No document data received');
          return;
        }

        // Validate document data
        const validatedDocument: Document = {
          id: data.id || '',
          images: Array.isArray(data.images) ? data.images : [],
          title: data.title || 'Untitled',
          description: data.description || '',
          reading_time:
            typeof data.reading_time === 'number' ? data.reading_time : 0,
          theme: data.theme || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          created_at: data.created_at || new Date().toISOString(),
        };

        setDocument(validatedDocument);
        setLoadingState('success');
      } catch (err) {
        if (isMountedRef.current) {
          handleError('Network error occurred while fetching document', err);
        }
      }
    },
    [handleError]
  );

  // Effect for fetching document
  useEffect(() => {
    if (!documentId) {
      handleError('Invalid document ID');
      return;
    }

    fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  // Memoized HTML content generation
  const htmlContent = useMemo(() => {
    if (!document) return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
          <meta charset="utf-8">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 18px;
              line-height: 1.6;
              color: ${colors.text};
              background-color: transparent;
              margin: 0;
              padding: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            strong, b {
              font-weight: 600;
            }
            em, i {
              font-style: italic;
            }
            p {
              margin: 0 0 16px 0;
            }
            p:last-child {
              margin-bottom: 0;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            a {
              color: ${colors.primary};
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          ${document.description || '<p>No content available.</p>'}
        </body>
      </html>
    `;
  }, [document, colors]);

  // Optimized WebView message handler
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (typeof data.height === 'number' && data.height > 0) {
        setWebViewHeight(Math.max(data.height, 50)); // Minimum height
      }
    } catch (error) {
      console.warn('Error parsing WebView message:', error);
    }
  }, []);

  // Memoized injected JavaScript
  const injectedJavaScript = useMemo(
    () => `
    (function() {
      function sendHeight() {
        try {
          const height = Math.max(
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight,
            document.body.scrollHeight,
            document.body.offsetHeight
          );
          
          if (height > 0 && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
          }
        } catch (e) {
          console.error('Error sending height:', e);
        }
      }

      // Send height when content is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendHeight);
      } else {
        sendHeight();
      }

      // Send height when images load
      const images = document.getElementsByTagName('img');
      for (let i = 0; i < images.length; i++) {
        images[i].addEventListener('load', sendHeight);
        images[i].addEventListener('error', sendHeight);
      }

      // Observe content changes
      if (window.MutationObserver) {
        const observer = new MutationObserver(function() {
          setTimeout(sendHeight, 100); // Debounce
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }

      return true;
    })();
  `,
    []
  );

  // Memoized back handler
  const handleBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to go back');
    }
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (documentId) {
      fetchDocument(documentId);
    }
  }, [documentId, fetchDocument]);

  // Image error handler
  const handleImageError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  // Format date safely
  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date inconnue';
    }
  }, []);

  // Loading state
  if (loadingState === 'loading') {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement du document...
        </Text>
      </View>
    );
  }

  // Error state
  if (error.hasError) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error.message}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Document not found
  if (!document) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Document introuvable
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true} // Performance optimization
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      {document.images.length > 0 && !imageLoadError && (
        <Image
          source={{ uri: document.images[0] }}
          style={styles.coverImage}
          onError={handleImageError}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={0}
          >
            {document.title}
          </Text>

          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {formatDate(document.created_at)}
              </Text>
            </View>

            {document.reading_time > 0 && (
              <View style={styles.metaItem}>
                <Clock size={16} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {document.reading_time} min
                </Text>
              </View>
            )}

            {document.theme && (
              <View style={styles.metaItem}>
                <BookOpen size={16} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {document.theme}
                </Text>
              </View>
            )}
          </View>

          {document.tags.length > 0 && (
            <View style={styles.tags}>
              {document.tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`} // More unique key
                  style={[
                    styles.tag,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.description}>
            <WebView
              ref={webViewRef}
              source={{ html: htmlContent }}
              style={{
                width: width - 48,
                height: webViewHeight,
                backgroundColor: 'transparent',
              }}
              originWhitelist={['*']}
              scalesPageToFit={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={handleWebViewMessage}
              injectedJavaScript={injectedJavaScript}
              scrollEnabled={false}
              mixedContentMode="compatibility"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error:', nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView HTTP error:', nativeEvent);
              }}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
    lineHeight: 40,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginBottom: 32,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});
