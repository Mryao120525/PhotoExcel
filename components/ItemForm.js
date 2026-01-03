import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const ItemForm = ({
  specificName,
  setSpecificName,
  itemName,
  setItemName,
  quantity,
  setQuantity,
  photos,
  onTakePhoto,
  onPickPhoto,
  onRemovePhoto,
  onAddRecord,
}) => (
  <View style={styles.sectionItem}>
    <Text style={styles.sectionTitle}>📦 类型录入</Text>

    <Text style={styles.label}>具体名称</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入具体名称"
      placeholderTextColor="#ccc"
      value={specificName}
      onChangeText={setSpecificName}
    />

    <Text style={styles.label}>具体类型</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入具体类型"
      placeholderTextColor="#ccc"
      value={itemName}
      onChangeText={setItemName}
    />

    <Text style={styles.label}>数量</Text>
    <TextInput
      style={styles.input}
      placeholder="请输入数量"
      placeholderTextColor="#ccc"
      value={quantity}
      onChangeText={setQuantity}
      keyboardType="number-pad"
    />

    <Text style={styles.label}>照片</Text>
    {photos && photos.length > 0 ? (
      <View style={styles.photoGrid}>
        {photos.map((p, idx) => (
          <View key={idx} style={styles.photoItem}>
            <Image source={{ uri: p }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => onRemovePhoto(idx)}
            >
              <Text style={styles.removePhotoText}>移除</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noPhotoText}>还未选择照片</Text>
    )}

    <View style={styles.photoButtonsRow}>
      <TouchableOpacity
        style={[styles.button, styles.cameraButton]}
        onPress={onTakePhoto}
      >
        <Text style={styles.buttonText}>📷 拍照</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.galleryButton]}
        onPress={onPickPhoto}
      >
        <Text style={styles.buttonText}>🖼 相册</Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      style={[styles.button, styles.addButton]}
      onPress={onAddRecord}
    >
      <Text style={styles.buttonTextLarge}>✓ 确认添加</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  sectionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
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
  noPhotoText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 10,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  photoItem: {
    position: 'relative',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#FF9800',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemForm;
