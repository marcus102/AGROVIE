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
  LogBox,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createClient } from '@supabase/supabase-js';
import RenderHtml from 'react-native-render-html';

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
            <RenderHtml
              contentWidth={width}
              source={{ html: document.description }}
              baseStyle={{ color: colors.text }}
              tagsStyles={{
                body: styles.htmlBase,
                strong: styles.strong,
                em: styles.em,
                p: styles.paragraph,
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
  htmlBase: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
  },
  strong: {
    fontFamily: 'Inter-Bold',
  },
  em: {
    fontFamily: 'Inter-Italic',
  },
  paragraph: {
    marginBottom: 16,
  },
});
