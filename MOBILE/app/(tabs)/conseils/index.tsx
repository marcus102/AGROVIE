import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useThemeStore } from '@/stores/theme';
import { Search, BookOpen, FileText, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Suppress specific warning about defaultProps in function components
LogBox.ignoreLogs([
  'TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release.',
]);

type Document = {
  id: string;
  images: string[];
  title: string;
  reading_time: number;
  theme: string;
  tags: string[];
  status: string;
};

export default function DocumentsScreen() {
  const { colors } = useThemeStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDocuments();
    } catch (error) {
      console.error('Error refreshing documents:', error);
    }
    setRefreshing(false);
  };

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, images, title, reading_time, theme, tags, status');

      if (error) {
        console.error('Error fetching documents:', error.message);
        return;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isOnline = doc.status === 'online'; // Add this check
    return matchesSearch && isOnline;
  });

  const DocumentCard = ({
    document,
    index,
  }: {
    document: Document;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[styles.resourceCard, { backgroundColor: colors.card }]}
    >
      {document.images.length > 0 && (
        <Image
          source={{ uri: document.images[0] }}
          style={styles.resourceImage}
        />
      )}

      <View style={styles.resourceContent}>
        <Text style={[styles.resourceTitle, { color: colors.text }]}>
          {document.title}
        </Text>
        <View
          style={[styles.readTime, { backgroundColor: colors.primary + '20' }]}
        >
          <BookOpen size={16} color={colors.primary} />
          <Text style={[styles.readTimeText, { color: colors.primary }]}>
            {document.reading_time} min
          </Text>
        </View>
        <Text style={[styles.theme, { color: colors.primary }]}>
          Theme: {document.theme}
        </Text>
        <View style={styles.tagsContainer}>
          {document.tags.map((tag, idx) => (
            <Text
              key={idx}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.primary + '20',
                  color: colors.primary,
                },
              ]}
            >
              {tag}
            </Text>
          ))}
        </View>

        {/* "Lire Le Document" Button */}
        <TouchableOpacity
          style={[styles.readButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/conseils/${document.id}`)}
        >
          <Text style={[styles.readButtonText, { color: colors.card }]}>
            Lire Le Document
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading documents...
        </Text>
      </View>
    );
  }

  const EmptyState = () => (
    <View
      style={[styles.emptyContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.emptyContent}>
        <FileText size={48} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.primary }]}>
          Aucune ressource disponible
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.muted }]}>
          {searchQuery
            ? `Aucun document trouvé pour "${searchQuery}"`
            : 'Revenez plus tard!'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header]}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Ressources et guides pour une agriculture moderne
        </Text>
      </View>
      <View style={styles.resourcesList}>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <RefreshCw size={20} color={colors.card} />
          )}
        </TouchableOpacity>
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
            />
          </View>
        </View>

        {filteredDocuments.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredDocuments}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <DocumentCard document={item} index={index} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FileText size={48} color={colors.muted} />
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                  Aucune ressource trouvée
                </Text>
              </View>
            }
            contentContainerStyle={
              filteredDocuments.length === 0
                ? { flex: 1, justifyContent: 'center' }
                : undefined
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    paddingVertical: 10,
    marginLeft: 8,
  },
  resourcesList: {
    padding: 16,
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
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  tag: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 12,
  },
  readButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  readButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
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
  }
});
