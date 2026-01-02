import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const LocationForm = ({
  majorLocation,
  setMajorLocation,
  minorLocation,
  setMinorLocation,
  locationHistory,
  onHistoryTagPress,
}) => (
  <View style={styles.sectionLocation}>
    <Text style={styles.sectionTitle}>📍 地点设置</Text>

    <Text style={styles.label}>大地点（如故宫）</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入大地点"
      placeholderTextColor="#ccc"
      value={majorLocation}
      onChangeText={setMajorLocation}
    />

    <Text style={styles.label}>小地点（如坤宁宫）</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入小地点"
      placeholderTextColor="#ccc"
      value={minorLocation}
      onChangeText={setMinorLocation}
    />

    {locationHistory.length > 0 && (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>快速切换历史小地点：</Text>
        <View style={styles.tagsContainer}>
          {locationHistory.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyTag}
              onPress={() => onHistoryTagPress(tag)}
            >
              <Text style={styles.historyTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  sectionLocation: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  historyContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#90caf9',
  },
  historyTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  historyTagText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LocationForm;
