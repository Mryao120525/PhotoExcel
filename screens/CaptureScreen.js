import React, { useContext, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../contexts/AppContext';

import LocationForm from '../components/LocationForm';
import ItemForm from '../components/ItemForm';
import SuccessToast from '../components/SuccessToast';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const CaptureScreen = () => {
  const {
    majorLocation, setMajorLocation,
    minorLocation, setMinorLocation,
    specificName, setSpecificName,
    itemName, setItemName,
    quantity, setQuantity,
    photos, setPhotos,
    locationHistory,
    editingRecordId,
    handleSaveRecord,
    handleCancelEdit,
  } = useContext(AppContext);
  
  const [showToast, setShowToast] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  // --- Handlers ---
  const onSave = () => {
    const success = handleSaveRecord();
    if (success) {
      setShowToast(true);
      // If not editing, navigate to the archive to see the new item
      if (!editingRecordId) {
        setTimeout(() => navigation.navigate('数据管理'), 500);
      }
    }
  };

  const saveHighResPhoto = async (uri) => {
    try {
      const dir = `${FileSystem.documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const fileName = `photo_${Date.now()}.jpg`;
      const dest = dir + fileName;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (err) {
      console.error('Failed to save high-res photo:', err);
      return uri; // fallback to original uri
    }
  };

  const handleTakePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('需要权限', '需要相机权限才能拍照。');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      const savedUri = await saveHighResPhoto(result.assets[0].uri);
      setPhotos((p) => [...p, savedUri]);
    }
  };

  const handlePickPhoto = async () => {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.status !== 'granted') {
      Alert.alert('需要权限', '需要相册权限才能选择照片。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
        const uris = await Promise.all(
          result.assets.map(asset => saveHighResPhoto(asset.uri))
        );
        setPhotos(p => [...p, ...uris]);
    }
  };

  const removePhotoAt = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <LocationForm
          majorLocation={majorLocation}
          setMajorLocation={setMajorLocation}
          minorLocation={minorLocation}
          setMinorLocation={setMinorLocation}
          locationHistory={locationHistory}
          onHistoryTagPress={setMinorLocation}
        />
        <ItemForm
          specificName={specificName}
          setSpecificName={setSpecificName}
          itemName={itemName}
          setItemName={setItemName}
          quantity={quantity}
          setQuantity={setQuantity}
          photos={photos}
          onTakePhoto={handleTakePhoto}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={removePhotoAt}
          onSaveRecord={onSave}
          editingRecordId={editingRecordId}
          onCancelEdit={handleCancelEdit}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
      {showToast && (
        <SuccessToast
          message={editingRecordId ? '更新成功' : '添加成功'}
          onHide={() => setShowToast(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  container: {
    flex: 1,
    padding: 16,
  },
});

export default CaptureScreen;

