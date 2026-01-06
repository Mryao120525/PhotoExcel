import React, { useContext, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../contexts/AppContext';

import LocationForm from '../components/LocationForm';
import ItemForm from '../components/ItemForm';
import SuccessToast from '../components/SuccessToast';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const CaptureScreen = () => {
  const {
    majorLocation, setMajorLocation,
    minorLocation, setMinorLocation,
    specificName, setSpecificName,
    itemName, setItemName,
    quantity, setQuantity,
    photos, setPhotos,
    scanningMethods, setScanningMethods,
    locationHistory,
    itemTypeHistory,
    editingRecordId,
    handleSaveRecord,
    handleCancelEdit,
    handleDeleteLocationFromHistory,
    handleDeleteItemTypeFromHistory,
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
      // 1. 保存到应用内部
      const dir = `${FileSystem.documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const fileName = `photo_${Date.now()}.jpg`;
      const dest = dir + fileName;
      await FileSystem.copyAsync({ from: uri, to: dest });
      
      // 2. 同时保存到本地图库
      await MediaLibrary.saveToLibraryAsync(uri);
      
      return dest;
    } catch (err) {
      console.error('Failed to save photo:', err);
      return uri; // fallback to original uri
    }
  };

  const handleTakePhoto = async () => {
    // 请求相机权限
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('需要权限', '需要相机权限才能拍照。');
      return;
    }
    
    // 请求媒体库权限
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
      Alert.alert('需要权限', '需要相册权限才能保存照片。');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      const savedUri = await saveHighResPhoto(result.assets[0].uri);
      setPhotos((p) => [...p, savedUri]);
    }
  };

  const handlePickPhoto = async () => {
    // 请求媒体库权限（选择照片和保存照片都需要）
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
      Alert.alert('需要权限', '需要相册权限才能选择和保存照片。');
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
          onDeleteHistoryTag={handleDeleteLocationFromHistory}
        />
        <ItemForm
          specificName={specificName}
          setSpecificName={setSpecificName}
          itemName={itemName}
          setItemName={setItemName}
          quantity={quantity}
          setQuantity={setQuantity}
          photos={photos}
          scanningMethods={scanningMethods}
          setScanningMethods={setScanningMethods}
          onTakePhoto={handleTakePhoto}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={removePhotoAt}
          onSaveRecord={onSave}
          editingRecordId={editingRecordId}
          onCancelEdit={handleCancelEdit}
          itemTypeHistory={itemTypeHistory}
          handleDeleteItemTypeFromHistory={handleDeleteItemTypeFromHistory}
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
    padding: 12,
  },
});

export default CaptureScreen;