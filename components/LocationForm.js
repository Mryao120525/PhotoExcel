import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const LocationForm = ({
  majorLocation,
  setMajorLocation,
  minorLocation,
  setMinorLocation,
  locationHistory,
  onHistoryTagPress,
  onDeleteHistoryTag,
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
            <View key={index} style={styles.historyTagWrapper}>
              <TouchableOpacity
                style={styles.historyTag}
                onPress={() => onHistoryTagPress(tag)}
              >
                <Text style={styles.historyTagText}>{tag}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteTagButton}
                onPress={() => onDeleteHistoryTag(tag)}
              >
                <Text style={styles.deleteTagButtonText}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  sectionLocation: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  historyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#90caf9',
  },
  historyTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 18,
    paddingLeft: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  historyTag: {
    paddingVertical: 5,
    paddingRight: 6,
  },
  historyTagText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteTagButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  deleteTagButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LocationForm;