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

    <Text style={styles.label}>景点名称（如故宫）</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入景点名称"
      placeholderTextColor="#ccc"
      value={majorLocation}
      onChangeText={setMajorLocation}
    />

    <Text style={styles.label}>景点区域（如坤宁宫）</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入景点区域"
      placeholderTextColor="#ccc"
      value={minorLocation}
      onChangeText={setMinorLocation}
    />

    {locationHistory.length > 0 && (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>快速切换历史景点区域：</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  historyTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  historyTagText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LocationForm;
