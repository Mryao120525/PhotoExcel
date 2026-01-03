import React, { useState, useContext, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../contexts/AppContext';
import RecordCard from '../components/RecordCard';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const ITEMS_PER_PAGE = 10;

const ArchiveScreen = () => {
  const { records, handleDeleteRecord, handleStartEdit } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    let sortedRecords = [...records].sort((a, b) => b.id - a.id);

    let indexedRecords = sortedRecords.map((record, index) => ({
      ...record,
      originalIndex: index
    }));

    if (!query) {
      return indexedRecords;
    }

    return indexedRecords.filter(record =>
      record.majorLocation.toLowerCase().includes(query) ||
      record.minorLocation.toLowerCase().includes(query) ||
      record.specificName.toLowerCase().includes(query) ||
      record.itemName.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  const onEdit = (id) => {
    handleStartEdit(id, scrollViewRef); // Pass the ref to scroll
    navigation.navigate('数据录入'); // Switch to capture tab
  };
  
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };
  
  const handleGeneratePDF = async () => {
    if (filteredRecords.length === 0) {
      Alert.alert('提示', '暂无数据，无法生成 PDF');
      return;
    }

    Alert.alert('处理中', '正在生成PDF，请稍候...');

    // Dynamically check for ImageManipulator
    let ImageManipulatorRuntime = null;
    try {
      ImageManipulatorRuntime = require('expo-image-manipulator');
    } catch (err) {
      console.warn('expo-image-manipulator not installed, skipping image processing for PDF.');
    }

    const getBase64FromUri = async (uri) => {
        try {
            return await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
        } catch (e) {
            console.error("Failed to read file as base64", e);
            return null;
        }
    };

    const styles = `
      @page { size: A4; margin: 10mm; }
      body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: center; word-wrap: break-word; }
      th { background-color: #4CAF50 !important; color: white !important; font-weight: bold; }
      tr:nth-child(even) { background-color: #f2f2f2 !important; }
      h1 { text-align: center; font-size: 18px; }
      img { max-width: 90px; max-height: 90px; margin: 2px; object-fit: cover; }
      .photos-container { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; }
      .photos-cell { max-height: 120px; overflow: hidden; vertical-align: top; }
    `;

    let tableRows = '';
    for (const record of filteredRecords) {
      let photosHtml = '<div class="photos-container">';
      for (const p of record.photos || []) {
        try {
          let base64Photo = null;
          if (ImageManipulatorRuntime) {
            const SaveFormat = ImageManipulatorRuntime.SaveFormat || ImageManipulatorRuntime.default?.SaveFormat;
            const format = SaveFormat ? SaveFormat.JPEG : 'jpeg';
            const manipResult = await ImageManipulatorRuntime.manipulateAsync(
              p, [{ resize: { width: 300 } }],
              { compress: 0.7, format: format, base64: true }
            );
            base64Photo = manipResult.base64;
          } else {
            base64Photo = await getBase64FromUri(p);
          }
          if(base64Photo) {
            photosHtml += `<img src="data:image/jpeg;base64,${base64Photo}" />`;
          }
        } catch (e) {
          console.error('Image processing/conversion failed: ', e);
          photosHtml += '<p style="color:red;">[img err]</p>';
        }
      }
      photosHtml += '</div>';

      tableRows += `
        <tr>
          <td>${record.originalIndex + 1}</td>
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
      <html><head><meta charset="UTF-8"><title>记录</title><style>${styles}</style></head>
      <body><h1>古建筑文物记录</h1><table>
      <col width="5%"><col width="16%"><col width="16%"><col width="16%"><col width="16%"><col width="21%"><col width="10%">
      <thead><tr><th>编号</th><th>景点名称</th><th>景点区域</th><th>具体名称</th><th>具体类型</th><th>照片</th><th>数量</th></tr></thead>
      <tbody>${tableRows}</tbody>
      </table></body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: '分享您的古建筑文物记录' });
      } else {
        Alert.alert('成功', `PDF 已生成到: ${uri}`);
      }
    } catch (error) {
      Alert.alert('错误', '生成 PDF 失败: ' + error.message);
    }
  };

  const recordsToShow = useMemo(() => 
    filteredRecords.slice(0, visibleCount),
    [filteredRecords, visibleCount]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="按名称或地点搜索..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF}>
                <Text style={styles.pdfButtonText}>导出 PDF</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>总数据量: {filteredRecords.length}</Text>
        </View>

        <FlatList
          ref={scrollViewRef}
          data={recordsToShow}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecordCard 
              item={item} 
              index={item.originalIndex + 1} 
              onDelete={handleDeleteRecord} 
              onEdit={onEdit} 
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>没有找到匹配的记录。</Text>
            </View>
          }
          ListFooterComponent={
            visibleCount < filteredRecords.length ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreButtonText}>加载更多</Text>
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
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
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#EDEDED',
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    paddingBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  pdfButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  loadMoreButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ArchiveScreen;

