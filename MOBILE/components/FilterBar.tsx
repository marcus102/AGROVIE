import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

interface FilterBarProps {
  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  colors: {
    primary: string;
    card: string;
    border: string;
    muted: string;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, selectedFilter, onFilterChange, colors }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
    {filters.map((filter) => (
      <TouchableOpacity
        key={filter}
        onPress={() => onFilterChange(filter)}
        style={[
          styles.filterButton,
          {
            backgroundColor: selectedFilter === filter ? colors.primary : colors.card,
            borderColor: selectedFilter === filter ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            { color: selectedFilter === filter ? colors.card : colors.muted },
          ]}
        >
          {formatFilterLabel(filter)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const formatFilterLabel = (filter: string): string => {
  // Capitalize the first letter and replace underscores with spaces
  return filter.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});