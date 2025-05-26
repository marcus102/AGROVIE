import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  workers: number;
  image: string;
  status: string;
  type: 'technician' | 'worker';
  applications: number;
  views: number;
}

export function JobList() {
  const user = useAuthStore((state) => state.user);
  const { colors } = useThemeStore();

  const getFilteredJobs = () => {
    const allJobs: Job[] = [
      {
        id: '1',
        title: 'Récolte de Pommes Bio',
        description: 'Récolte de pommes biologiques dans un verger de 5 hectares',
        location: 'Normandie, France',
        duration: '2 semaines',
        workers: 8,
        image: 'https://images.unsplash.com/photo-1444392061186-9fc38f84f726?q=80&w=1200&auto=format&fit=crop',
        status: 'active',
        type: 'worker',
        applications: 12,
        views: 156,
      },
      {
        id: '2',
        title: 'Maintenance des Serres',
        description: 'Entretien et réparation des systèmes d\'irrigation',
        location: 'Loire-Atlantique',
        duration: '5 jours',
        workers: 3,
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop',
        status: 'active',
        type: 'technician',
        applications: 5,
        views: 89,
      },
    ];

    if (user?.role === 'admin') {
      return allJobs;
    }

    return allJobs.filter(job => {
      if (user?.role === 'entrepreneur') return true;
      if (user?.role === 'technician') return job.type === 'technician';
      if (user?.role === 'worker') return job.type === 'worker';
      return false;
    });
  };

  const jobs = getFilteredJobs();

  return (
    <View style={styles.container}>
      {jobs.map((job, index) => (
        <Animated.View
          key={job.id}
          entering={FadeInDown.delay(index * 200)}
          style={[styles.jobCard, { backgroundColor: colors.card }]}
        >
          <Image source={{ uri: job.image }} style={styles.jobImage} />
          <View style={styles.jobContent}>
            <View style={styles.jobHeader}>
              <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
              {user?.role !== 'worker' && (
                <View style={styles.metrics}>
                  <Text style={[styles.metricText, { color: colors.muted }]}>
                    {job.views} views
                  </Text>
                  <Text style={[styles.metricText, { color: colors.muted }]}>
                    {job.applications} applications
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.jobDescription, { color: colors.muted }]} numberOfLines={2}>
              {job.description}
            </Text>

            <View style={styles.jobDetails}>
              <View style={styles.detailItem}>
                <MapPin size={16} color={colors.muted} />
                <Text style={[styles.detailText, { color: colors.muted }]}>
                  {job.location}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={16} color={colors.muted} />
                <Text style={[styles.detailText, { color: colors.muted }]}>
                  {job.duration}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Users size={16} color={colors.muted} />
                <Text style={[styles.detailText, { color: colors.muted }]}>
                  {job.workers} personnes
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/mission/${job.id}`)}
            >
              <Text style={styles.viewButtonText}>
                {user?.role === 'worker' ? 'Postuler' : 'Gérer les candidatures'}
              </Text>
              <ChevronRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobImage: {
    width: '100%',
    height: 200,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#111827',
    flex: 1,
  },
  metrics: {
    alignItems: 'flex-end',
  },
  metricText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  jobDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#166534',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
  },
});