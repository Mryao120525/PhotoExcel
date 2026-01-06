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
  ScrollView,
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
  scanningMethods,
  setScanningMethods,
}) => {
  const isEditing = editingRecordId !== null;
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);
  const [showScanningMethodsModal, setShowScanningMethodsModal] = useState(false);
  
  const scanningMethodsOptions = ['无人机', '手持扫描仪', '相机', '架站扫描仪'];
  
  const toggleScanningMethod = (method) => {
    if (scanningMethods.includes(method)) {
      setScanningMethods(scanningMethods.filter(m => m !== method));
    } else {
      if (scanningMethods.length < 4) {
        setScanningMethods([...scanningMethods, method]);
      }
    }
  };

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
      
      <Text style={styles.label}>扫描方式</Text>
      <TouchableOpacity 
        style={styles.multiSelectButton}
        onPress={() => setShowScanningMethodsModal(true)}
      >
        <Text style={styles.multiSelectButtonText}>
          {scanningMethods.length > 0 ? scanningMethods.join('+') : '请选择扫描方式'}
        </Text>
        <Text style={styles.multiSelectButtonArrow}>▼</Text>
      </TouchableOpacity>
      <Text style={styles.multiSelectHint}>
        已选择 {scanningMethods.length}/4 种方式
      </Text>
      
      {/* Scanning Methods Modal */}
      <Modal
        visible={showScanningMethodsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScanningMethodsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择扫描方式</Text>
            <Text style={styles.modalSubtitle}>最多选择4种方式</Text>
            
            <View style={styles.multiSelectOptions}>
              {scanningMethodsOptions.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.multiSelectOption,
                    scanningMethods.includes(method) && styles.multiSelectOptionSelected
                  ]}
                  onPress={() => toggleScanningMethod(method)}
                >
                  <Text style={[
                    styles.multiSelectOptionText,
                    scanningMethods.includes(method) && styles.multiSelectOptionTextSelected
                  ]}>
                    {method}
                  </Text>
                  {scanningMethods.includes(method) && (
                    <Text style={styles.multiSelectOptionCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowScanningMethodsModal(false)}
            >
              <Text style={styles.modalConfirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  multiSelectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiSelectButtonText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  multiSelectButtonArrow: {
    fontSize: 10,
    color: '#666',
  },
  multiSelectHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  multiSelectOptions: {
    marginBottom: 20,
  },
  multiSelectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  multiSelectOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  multiSelectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  multiSelectOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  multiSelectOptionCheckmark: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  noPhotoText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 8,
  },
  photoPreview: {
    width: 70,
    height: 70,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  photoItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  photoButtonMargin: {
    marginRight: 8,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputWithDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
  },
  dropdownButtonText: {
    fontSize: 10,
    color: '#666',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: 150,
  },
  dropdownItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#333',
  },
  deleteDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteDropdownItemText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
  },
  noDropdownItems: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ItemForm;