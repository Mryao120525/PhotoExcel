import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Keyboard,
} from 'react-native';
// runtime-load optional native modules to avoid bundler red screens when not installed
let AsyncStorageRuntime = null;
try {
  AsyncStorageRuntime = require('@react-native-async-storage/async-storage');
} catch (err) {
  console.warn('@react-native-async-storage/async-storage 未安装，启用内存回退。');
}

import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

let ImageManipulatorRuntime = null;
try {
  ImageManipulatorRuntime = require('expo-image-manipulator');
} catch (err) {
  console.warn('expo-image-manipulator 未安装，PDF 生成时将跳过图像处理。');
}

// In-memory fallback for AsyncStorage when not installed
const _memoryStorage = new Map();
const getItemAsync = async (key) => {
  if (AsyncStorageRuntime && AsyncStorageRuntime.getItem) {
    return await AsyncStorageRuntime.getItem(key);
  }
  return _memoryStorage.has(key) ? _memoryStorage.get(key) : null;
};
const setItemAsync = async (key, value) => {
  if (AsyncStorageRuntime && AsyncStorageRuntime.setItem) {
    return await AsyncStorageRuntime.setItem(key, value);
  }
  _memoryStorage.set(key, value);
  return null;
};

import LocationForm from './components/LocationForm';
import ItemForm from './components/ItemForm';
import RecordList from './components/RecordList';

export default function App() {
  // Form states
  const [majorLocation, setMajorLocation] = useState('');
  const [minorLocation, setMinorLocation] = useState('');
  const [specificName, setSpecificName] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photos, setPhotos] = useState([]);

  // Data and UI states
  const [records, setRecords] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isInitialMount = useRef(true);
  const scrollViewRef = useRef(null);
  const recordsPerPage = 10;

  // Load data from storage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedRecords = await getItemAsync('records');
        if (storedRecords !== null) {
          setRecords(JSON.parse(storedRecords));
        }
        const storedHistory = await getItemAsync('locationHistory');
        if (storedHistory !== null) {
          setLocationHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error('Failed to load data from storage', e);
        Alert.alert('错误', '加载本地数据失败。');
      }
    };

    loadData();
  }, []); // Empty array ensures this runs only on mount

  // Save data to storage whenever records or history change
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const saveData = async () => {
      try {
        await setItemAsync('records', JSON.stringify(records));
        await setItemAsync('locationHistory', JSON.stringify(locationHistory));
      } catch (e) {
        console.error('Failed to save data to storage', e);
        Alert.alert('错误', '保存数据到本地失败。');
      }
    };

    saveData();
  }, [records, locationHistory]);

  const clearForm = () => {
    setMajorLocation('');
    setMinorLocation('');
    setSpecificName('');
    setItemName('');
    setQuantity('');
    setPhotos([]);
  };

  // --- CRUD and other handlers ---

  const handleStartEdit = (id) => {
    const recordToEdit = records.find((r) => r.id === id);
    if (recordToEdit) {
      setMajorLocation(recordToEdit.majorLocation);
      setMinorLocation(recordToEdit.minorLocation);
      setSpecificName(recordToEdit.specificName);
      setItemName(recordToEdit.itemName);
      setQuantity(recordToEdit.quantity);
      setPhotos(recordToEdit.photos);
      setEditingRecordId(id);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert('编辑模式', '数据已回填到表单，请修改后点击“更新记录”。');
    }
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    clearForm();
    Keyboard.dismiss();
  };

  const handleSaveRecord = () => {
    if (!majorLocation.trim() || !minorLocation.trim() || !specificName.trim() || !itemName.trim() || !quantity.trim()) {
      Alert.alert('提示', '所有字段均为必填项');
      return;
    }
    if (!photos || photos.length === 0) {
      Alert.alert('提示', '请拍摄或选择至少一张照片');
      return;
    }

    // Update logic
    if (editingRecordId) {
      const updatedRecords = records.map((r) =>
        r.id === editingRecordId
          ? { ...r, majorLocation, minorLocation, specificName, itemName, quantity, photos }
          : r
      );
      setRecords(updatedRecords);
      Alert.alert('成功', '记录已更新');
    } 
    // Create logic
    else {
      const newRecord = {
        id: Date.now(),
        majorLocation,
        minorLocation,
        specificName,
        itemName,
        quantity,
        photos,
      };
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      
      // Go to the last page where the new record is
      const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
      setCurrentPage(totalPages || 1);
      Alert.alert('成功', '记录已添加');
    }
    
    // Add new location to history if it doesn't exist
    if (!locationHistory.includes(minorLocation)) {
      setLocationHistory([...locationHistory, minorLocation]);
    }

    setEditingRecordId(null);
    clearForm();
    Keyboard.dismiss();
  };

  const handleDeleteRecord = (id) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          // If deleting the record currently being edited, cancel edit mode
          if (id === editingRecordId) {
            handleCancelEdit();
          }
          const updatedRecords = records.filter((r) => r.id !== id);
          setRecords(updatedRecords);
        },
      },
    ]);
  };

  // --- Filtering and Pagination Logic ---

  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase();
    return (
      record.majorLocation.toLowerCase().includes(query) ||
      record.minorLocation.toLowerCase().includes(query) ||
      record.specificName.toLowerCase().includes(query) ||
      record.itemName.toLowerCase().includes(query)
    );
  }).sort((a, b) => b.id - a.id); // Show newest first

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  // --- Other handlers ---

  const handleHistoryTagPress = (tag) => {
    setMinorLocation(tag);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Photo handlers and PDF generation... (omitted for brevity, no changes needed)
  const handleTakePhoto = async () => {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          '权限被拒绝',
          '需要相机权限才能拍照。请在设置中开启权限。'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;
        const savedUri = await saveHighResPhoto(originalUri);
        const finalUri = savedUri || originalUri;
        setPhotos((p) => [...p, finalUri]);
      }
    } catch (error) {
      console.error('拍照错误:', error);
      Alert.alert('错误', '拍照失败，请检查设备设置或重试');
    }
  };

  const handlePickPhoto = async () => {
    try {
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (libraryPermission.status !== 'granted') {
        Alert.alert(
          '权限被拒绝',
          '需要相册权限才能选择照片。请在设置中开启权限。'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = await Promise.all(
          result.assets.map(async (a) => {
            const originalUri = a.uri;
            const savedUri = await saveHighResPhoto(originalUri);
            return savedUri || originalUri;
          })
        );
        setPhotos((p) => [...p, ...uris]);
      }
    } catch (error) {
      console.error('选择照片错误:', error);
      Alert.alert('错误', '选择照片失败，请重试');
    }
  };

  const saveHighResPhoto = async (uri) => {
    try {
      const dir = `${FileSystem.documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const extMatch = uri.match(/\.([a-zA-Z0-9]+)($|\?)/);
      const ext = extMatch ? `.${extMatch[1]}` : '.jpg';
      const fileName = `photo_${Date.now()}${ext}`;
      const dest = dir + fileName;

      if (uri.startsWith('ph://')) {
        try {
          const MediaLibrary = require('expo-media-library');
          const assetId = uri.replace('ph://', '');
          const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
          if (assetInfo && assetInfo.localUri) {
            await FileSystem.copyAsync({ from: assetInfo.localUri, to: dest });
            return dest;
          }
        } catch (e) {
          console.warn('通过 MediaLibrary 解析 ph:// 失败。请确保 expo-media-library 已安装。', e);
        }
      }

      if (uri.startsWith('file://')) {
        await FileSystem.copyAsync({ from: uri, to: dest });
        return dest;
      }
      
      await FileSystem.downloadAsync(uri, dest);
      return dest;

    } catch (err) {
      console.error('保存高清照片失败:', err);
      return null;
    }
  };

  const removePhotoAt = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };
  
  const handleGeneratePDF = async () => {
    if (records.length === 0) {
      Alert.alert('提示', '暂无数据，无法生成 PDF');
      return;
    }

    Alert.alert('处理中', '正在生成PDF，请稍候...');

    const styles = `
      @page {
        size: A4;
        margin: 10mm; /* 按照用户建议修改边距 */
      }
      body {
        font-family: Arial, sans-serif;
        -webkit-print-color-adjust: exact;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed; /* 按照用户建议优化表格布局 */
      }
      thead {
        display: table-header-group;
      }
      tr {
        page-break-inside: avoid; /* 强制行不跨页 */
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
        word-wrap: break-word;
      }
      th {
        background-color: #4CAF50 !important;
        color: white !important;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f2f2f2 !important;
      }
      h1 {
        text-align: center;
        font-size: 18px;
      }
      img {
        max-width: 90px;
        max-height: 90px;
        margin: 2px;
        object-fit: cover;
      }
      .photos-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
      }
      /* 按照用户建议，给图片单元格添加额外样式 */
      .photos-cell {
        max-height: 120px; /* 限制最大高度 */
        overflow: hidden; /* 超出部分隐藏 */
        vertical-align: top;
      }
    `;

    let tableRows = '';
    for (const record of records) {
      let photosHtml = '<div class="photos-container">';
      const recPhotos = record.photos || [];
      for (const p of recPhotos) {
        try {
          if (ImageManipulatorRuntime && ImageManipulatorRuntime.manipulateAsync) {
            const manipResult = await ImageManipulatorRuntime.manipulateAsync(
              p,
              [{ resize: { width: 300 } }],
              { compress: 0.7, format: ImageManipulatorRuntime.SaveFormat.JPEG, base64: true }
            );
            photosHtml += `<img src="data:image/jpeg;base64,${manipResult.base64}" />`;
          } else {
            const base64Photo = await getBase64FromUri(p);
            photosHtml += `<img src="data:image/jpeg;base64,${base64Photo}" />`;
          }
        } catch (e) {
          console.error('图片处理或转换失败: ', e);
          photosHtml += '<p style="color:red;">[图片加载失败]</p>';
        }
      }
      photosHtml += '</div>';

      tableRows += `
        <tr>
          <td>${record.majorLocation}</td>
          <td>${record.minorLocation}</td>
          <td>${record.specificName}</td>
          <td>${record.itemName}</td>
          <td class="photos-cell">${photosHtml}</td>
          <td>${record.quantity}</td>
        </tr>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>古建筑文物记录</title>
          <style>${styles}</style>
        </head>
        <body>
          <h1>古建筑文物记录</h1>
          <table>
            <col width="18%">
            <col width="18%">
            <col width="18%">
            <col width="18%">
            <col width="20%">
            <col width="8%">
            <thead>
              <tr>
                <th>景点名称</th>
                <th>景点区域</th>
                <th>具体名称</th>
                <th>具体类型</th>
                <th>照片</th>
                <th>数量</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: '分享您的古建筑文物记录' });
      } else {
        Alert.alert('成功', `PDF 已生成到: ${uri}`);
      }
    } catch (error) {
      Alert.alert('错误', '生成 PDF 失败: ' + error.message);
    }
  };

  const getBase64FromUri = async (uri) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LocationForm
          majorLocation={majorLocation}
          setMajorLocation={setMajorLocation}
          minorLocation={minorLocation}
          setMinorLocation={setMinorLocation}
          locationHistory={locationHistory}
          onHistoryTagPress={handleHistoryTagPress}
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
          onSaveRecord={handleSaveRecord}
          editingRecordId={editingRecordId}
          onCancelEdit={handleCancelEdit}
        />

        <RecordList
          records={currentRecords}
          onDeleteRecord={handleDeleteRecord}
          onEditRecord={handleStartEdit}
          onGeneratePDF={handleGeneratePDF}
          totalRecords={filteredRecords.length}
          recordsPerPage={recordsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 30,
  },
});
