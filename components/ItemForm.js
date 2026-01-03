import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  FlatList,
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
  onSaveRecord,
  editingRecordId,
  onCancelEdit,
  itemTypeHistory,
  handleDeleteItemTypeFromHistory,
}) => {
  const isEditing = editingRecordId !== null;
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);

  const handleSelectItemType = (type) => {
    setItemName(type);
    setShowItemTypeDropdown(false);
  };

  return (
    <View style={styles.sectionItem}>
      <Text style={styles.sectionTitle}>{isEditing ? '📝 编辑记录' : '📦 类型录入'}</Text>

      <Text style={styles.label}>具体名称</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入具体名称"
        placeholderTextColor="#ccc"
        value={specificName}
        onChangeText={setSpecificName}
      />

      <Text style={styles.label}>具体类型</Text>
      <View style={styles.inputWithDropdown}>
        <TextInput
          style={styles.input}
          placeholder="请输入具体类型"
          placeholderTextColor="#ccc"
          value={itemName}
          onChangeText={setItemName}
        />
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={() => setShowItemTypeDropdown(!showItemTypeDropdown)}
        >
          <Text style={styles.dropdownButtonText}>▼</Text>
        </TouchableOpacity>
      </View>
      
      {showItemTypeDropdown && (
        <View style={styles.dropdownMenu}>
          {itemTypeHistory && itemTypeHistory.length > 0 ? (
            itemTypeHistory.map((type, index) => (
              <View key={index} style={styles.dropdownItemWrapper}>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleSelectItemType(type)}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteDropdownItem} 
                  onPress={() => handleDeleteItemTypeFromHistory(type)}
                >
                  <Text style={styles.deleteDropdownItemText}>x</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDropdownItems}>暂无常用类型，请先添加</Text>
          )}
        </View>
      )}

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
          style={[styles.button, styles.cameraButton, styles.photoButtonMargin]}
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
        style={[styles.button, isEditing ? styles.updateButton : styles.addButton]}
        onPress={onSaveRecord}
      >
        <Text style={styles.buttonTextLarge}>{isEditing ? '✓ 更新记录' : '✓ 确认添加'}</Text>
      </TouchableOpacity>
      
      {isEditing && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancelEdit}
        >
          <Text style={styles.buttonText}>✗ 取消编辑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
    marginBottom: 10,
  },
  photoItem: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
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
    marginBottom: 15,
  },
  photoButtonMargin: {
    marginRight: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    marginTop: 0,
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    marginTop: 0,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: '#ffc107',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputWithDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  dropdownButtonText: {
    fontSize: 12,
    color: '#666',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  dropdownItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  deleteDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  deleteDropdownItemText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: 'bold',
  },
  noDropdownItems: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ItemForm;