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
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  LogBox,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useThemeStore } from '@/stores/theme';
import { Search, BookOpen, FileText, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

// Initialize Supabase client with error handling
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Suppress specific warnings
LogBox.ignoreLogs([
  'TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release.',
  'Non-serializable values were found in the navigation state',
]);

type Document = {
  id: string;
  images: string[] | null;
  title: string;
  reading_time: number;
  theme: string;
  tags: string[] | null;
  status: string;
};

type DocumentsState = {
  data: Document[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
};

const INITIAL_STATE: DocumentsState = {
  data: [],
  loading: true,
  error: null,
  refreshing: false,
};

const SEARCH_DEBOUNCE_MS = 300;

export default function DocumentsScreen() {
  const { colors } = useThemeStore();
  const [state, setState] = useState<DocumentsState>(INITIAL_STATE);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Safe state update function
  const safeSetState = useCallback(
    (updater: (prev: DocumentsState) => DocumentsState) => {
      if (isMountedRef.current) {
        setState(updater);
      }
    },
    []
  );

  // Error handler
  const handleError = useCallback(
    (error: unknown, context: string) => {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error(`Error in ${context}:`, error);

      safeSetState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
        refreshing: false,
      }));
    },
    [safeSetState]
  );

  // Fetch documents with comprehensive error handling and pull-to-refresh support
  const fetchDocuments = useCallback(
    async (isRefresh = false) => {
      if (!supabase) {
        handleError(
          new Error('Supabase client not initialized'),
          'fetchDocuments'
        );
        return;
      }

      try {
        safeSetState((prev) => ({
          ...prev,
          loading: !isRefresh, // Don't show main loading spinner during refresh
          refreshing: isRefresh, // Show pull-to-refresh indicator
          error: null,
        }));

        const { data, error } = await supabase
          .from('documents')
          .select('id, images, title, reading_time, theme, tags, status')
          .order('title', { ascending: true });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        // Validate and sanitize data
        const validatedData: Document[] = data
          .filter((item): item is Document => {
            return (
              typeof item?.id === 'string' &&
              typeof item?.title === 'string' &&
              typeof item?.reading_time === 'number' &&
              typeof item?.theme === 'string' &&
              typeof item?.status === 'string'
            );
          })
          .map((item) => ({
            ...item,
            images: Array.isArray(item.images) ? item.images : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            title: item.title.trim(),
            theme: item.theme.trim(),
          }));

        safeSetState((prev) => ({
          ...prev,
          data: validatedData,
          loading: false,
          refreshing: false, // Hide pull-to-refresh indicator
          error: null,
        }));
      } catch (error) {
        handleError(error, 'fetchDocuments');
      }
    },
    [supabase, handleError, safeSetState]
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchDocuments(true);
  }, [fetchDocuments]);

  // Retry handler for errors
  const handleRetry = useCallback(() => {
    setState(INITIAL_STATE);
    fetchDocuments();
  }, [fetchDocuments]);

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Debounced search
  const debouncedSearchQuery = useMemo(() => {
    return searchQuery.trim().toLowerCase();
  }, [searchQuery]);

  // Memoized filtered documents
  const filteredDocuments = useMemo(() => {
    if (!debouncedSearchQuery) {
      return state.data.filter((doc) => doc.status === 'online');
    }

    return state.data.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(debouncedSearchQuery) ||
        doc.theme.toLowerCase().includes(debouncedSearchQuery) ||
        (doc.tags &&
          doc.tags.some((tag) =>
            tag.toLowerCase().includes(debouncedSearchQuery)
          ));
      const isOnline = doc.status === 'online';
      return matchesSearch && isOnline;
    });
  }, [state.data, debouncedSearchQuery]);

  // Navigation handler with error handling
  const handleDocumentPress = useCallback((documentId: string) => {
    try {
      router.push(`../conseil/${documentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to open document. Please try again.');
    }
  }, []);

  // Memoized document card component
  const DocumentCard = React.memo(
    ({ document, index }: { document: Document; index: number }) => {
      const hasImage =
        Array.isArray(document.images) && document.images.length > 0;
      const imageUri = hasImage ? document.images![0] : null;
      const tags = document.tags || [];

      return (
        <Animated.View
          entering={FadeInDown.delay(Math.min(index * 100, 500))} // Cap animation delay
          style={[styles.resourceCard, { backgroundColor: colors.card }]}
        >
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.resourceImage}
              onError={(error) => {
                console.warn('Image load error:', error.nativeEvent.error);
              }}
              resizeMode="cover"
            />
          )}

          <View style={styles.resourceContent}>
            <Text
              style={[styles.resourceTitle, { color: colors.text }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {document.title}
            </Text>

            <View
              style={[
                styles.readTime,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <BookOpen size={16} color={colors.primary} />
              <Text style={[styles.readTimeText, { color: colors.primary }]}>
                {document.reading_time} min
              </Text>
            </View>

            <Text
              style={[styles.theme, { color: colors.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Theme: {document.theme}
            </Text>

            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.slice(0, 3).map(
                  (
                    tag,
                    idx // Limit tags display
                  ) => (
                    <Text
                      key={`${document.id}-tag-${idx}`}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: colors.primary + '20',
                          color: colors.primary,
                        },
                      ]}
                    >
                      {tag.length > 15 ? `${tag.substring(0, 15)}...` : tag}
                    </Text>
                  )
                )}
                {tags.length > 3 && (
                  <Text
                    style={[
                      styles.tag,
                      {
                        backgroundColor: colors.primary + '20',
                        color: colors.primary,
                      },
                    ]}
                  >
                    +{tags.length - 3}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.readButton, { backgroundColor: colors.primary }]}
              onPress={() => handleDocumentPress(document.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.readButtonText, { color: colors.card }]}>
                Lire Le Document
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }
  );

  // Error state component
  const ErrorState = useCallback(
    () => (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyContent}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[styles.emptyTitle, { color: colors.error }]}>
            Erreur de chargement
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.muted }]}>
            {state.error || "Une erreur inattendue s'est produite"}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text style={[styles.retryButtonText, { color: colors.card }]}>
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [colors, state.error, handleRetry]
  );

  // Empty state component
  const EmptyState = useCallback(
    () => (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyContent}>
          <FileText size={48} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>
            Aucune ressource disponible
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.muted }]}>
            {debouncedSearchQuery
              ? `Aucun document trouvé pour "${searchQuery}"`
              : 'Revenez plus tard!'}
          </Text>
        </View>
      </View>
    ),
    [colors, debouncedSearchQuery, searchQuery]
  );

  // Loading state
  if (state.loading && !state.refreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement des documents...
        </Text>
      </View>
    );
  }

  // Error state
  if (state.error && !state.loading && !state.refreshing) {
    return <ErrorState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Ressources et guides pour une agriculture moderne
        </Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Search size={20} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher des ressources..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Documents List with Pull-to-Refresh */}
        {filteredDocuments.length === 0 &&
        !state.loading &&
        !state.refreshing ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredDocuments}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <DocumentCard document={item} index={index} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]} // Android
                tintColor={colors.primary} // iOS
                title="Actualisation..." // iOS only
                titleColor={colors.text} // iOS only
              />
            }
            contentContainerStyle={[
              styles.listContent,
              filteredDocuments.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            getItemLayout={(data, index) => ({
              length: 300, // Approximate item height
              offset: 300 * index,
              index,
            })}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  resourceCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  resourceImage: {
    width: '100%',
    height: 200,
  },
  resourceContent: {
    padding: 16,
  },
  resourceTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  readTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  theme: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  readButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  readButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
