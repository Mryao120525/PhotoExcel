import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const RecordCard = ({ item, onDelete }) => (
  <View style={styles.recordCard}>
    <View style={styles.recordContent}>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>大地点：</Text>
        <Text style={styles.recordValue}>{item.majorLocation}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>小地点：</Text>
        <Text style={styles.recordValue}>{item.minorLocation}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>物品：</Text>
        <Text style={styles.recordValue}>{item.itemName}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>数量：</Text>
        <Text style={styles.recordValue}>{item.quantity}</Text>
      </View>
      {item.photos && item.photos.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {item.photos.map((p, i) => (
            <Image key={i} source={{ uri: p }} style={styles.recordPhoto} />
          ))}
        </View>
      )}
    </View>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(item.id)}
    >
      <Text style={styles.deleteButtonText}>删除</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordContent: {
    flex: 1,
    marginRight: 10,
  },
  recordRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  recordLabel: {
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  recordValue: {
    color: '#666',
    flex: 1,
  },
  recordPhoto: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecordCard;
