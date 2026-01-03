import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RecordCard = ({ item, onDelete, onEdit }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Safely determine the image source
  const imageSource = (item.photos && item.photos.length > 0 && item.photos[0])
    ? { uri: item.photos[0] }
    : require('../assets/icon.png');

  return (
    <View style={styles.card}>
      <Image
        source={imageSource}
        style={styles.photo}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.specificName}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.majorLocation} / {item.minorLocation}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.id)}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onEdit(item.id)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={22} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={22} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default RecordCard;
