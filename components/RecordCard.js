import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const RecordCard = ({ item, onDelete, onEdit }) => (
  <View style={styles.recordCard}>
    <View style={styles.recordContent}>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>景点名称：</Text>
        <Text style={styles.recordValue}>{item.majorLocation}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>景点区域：</Text>
        <Text style={styles.recordValue}>{item.minorLocation}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>具体名称：</Text>
        <Text style={styles.recordValue}>{item.specificName}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>具体类型：</Text>
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
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => onEdit(item.id)}
      >
        <Text style={styles.actionButtonText}>编辑</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.actionButtonText}>删除</Text>
      </TouchableOpacity>
    </View>
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
    alignItems: 'center',
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
    width: 80,
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
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  actionButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecordCard;
