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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const ITEMS_PER_PAGE = 10;

const ArchiveScreen = () => {
  const { records, handleDeleteRecord, handleDeleteRecords, handleStartEdit } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPageSizeOptions, setShowPageSizeOptions] = useState(false);
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
    if (isSelectionMode) {
      toggleSelect(id);
      return;
    }
    handleStartEdit(id, scrollViewRef); // Pass the ref to scroll
    navigation.navigate('数据录入'); // Switch to capture tab
  };

  const toggleSelect = (id) => {
    setSelectedIds(prevSelected => {
      if (prevSelected.includes(id)) {
        // Remove item from selection
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        // Add item to selection
        return [...prevSelected, id];
      }
    });
  };

  const handleLongPress = (id) => {
    if (!isSelectionMode) {
      // Enter selection mode with the pressed item selected
      setIsSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === recordsToShow.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recordsToShow.map(item => item.id));
    }
  };

  const handleInvertSelection = () => {
    const allIds = recordsToShow.map(item => item.id);
    const invertedIds = allIds.filter(id => !selectedIds.includes(id));
    setSelectedIds(invertedIds);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      Alert.alert('提示', '请先选择要删除的记录');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedIds.length} 条记录吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            handleDeleteRecords(selectedIds);
            setSelectedIds([]);
            setIsSelectionMode(false);
          }
        }
      ]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };
  
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + itemsPerPage);
  };

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    // Reset visible count to the new page size
    setVisibleCount(size);
    setShowPageSizeOptions(false);
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
      /* 标准A4页面设置 */
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 8mm 10mm; /* 上下8mm，左右10mm的边距，确保内容不紧贴边缘 */
        @top-center { content: "古建筑文物记录"; font-size: 16pt; font-weight: bold; }
        @bottom-right { content: "页码 " counter(page) " / " counter(pages); }
      }
      
      /* 全局样式 */
      body { 
        font-family: Arial, sans-serif; 
        font-size: 12pt; 
        color: #333; 
        -webkit-print-color-adjust: exact; 
        background-color: white;
        margin: 0;
        padding: 0;
      }
      
      /* 表格样式 */
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 20px;
        page-break-inside: avoid; /* 尽量避免表格被分页切开 */
      }
      
      /* 表头样式 */
      thead { 
        display: table-header-group; 
        page-break-inside: avoid; 
        page-break-after: avoid;
      }
      
      /* 行样式 */
      tr {
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: auto;
        display: table-row;
        break-inside: avoid-page;
      }
      
      /* 单元格样式 */
      th, td {
        border: 1px solid #000;
        padding: 6px;
        text-align: center;
        word-wrap: break-word;
        font-size: 10pt;
        page-break-inside: avoid; /* 确保单元格内容不被分页切开 */
      }
      
      /* 表头单元格 */
      th { 
        background-color: #4CAF50 !important; 
        color: white !important; 
        font-weight: bold; 
        padding: 8px;
      }
      
      /* 交替行背景色 */
      tr:nth-child(even) { 
        background-color: #f2f2f2 !important; 
      }
      
      /* 标题样式 */
      h1 { 
        text-align: center; 
        font-size: 16pt; 
        margin-bottom: 20px;
        color: #333;
      }
      
      /* 图片样式 */
      img {
        max-width: 60px;
        max-height: 60px;
        margin: 2px;
        object-fit: cover;
        border: 1px solid #ddd;
      }
      
      /* 图片容器 */
      .photos-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        padding: 4px;
      }
      
      /* 图片单元格 */
      .photos-cell {
        min-height: 80px;
        max-height: 100px;
        overflow: hidden;
        vertical-align: top;
        padding: 4px;
      }
      
      /* 调整列宽以适应A4页面 */
      col:nth-child(1) { width: 6%; }    /* 编号 */
      col:nth-child(2) { width: 14%; }   /* 景点名称 */
      col:nth-child(3) { width: 14%; }   /* 景点区域 */
      col:nth-child(4) { width: 17%; }   /* 具体名称 */
      col:nth-child(5) { width: 17%; }   /* 具体类型 */
      col:nth-child(6) { width: 20%; }   /* 照片 */
      col:nth-child(7) { width: 12%; }   /* 数量 */
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
            // 调整图片大小以适应PDF，确保打印质量和表格布局
            const manipResult = await ImageManipulatorRuntime.manipulateAsync(
              p, [{ resize: { width: 120, height: 120 } }],
              { compress: 0.8, format: format, base64: true, quality: 0.8 }
            );
            base64Photo = manipResult.base64;
          } else {
            base64Photo = await getBase64FromUri(p);
          }
          if(base64Photo) {
            photosHtml += `<img src="data:image/jpeg;base64,${base64Photo}" alt="文物照片" />`;
          }
        } catch (e) {
          console.error('Image processing/conversion failed: ', e);
          photosHtml += '<p style="color:red;font-size:8pt;">[图片加载失败]</p>';
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>古建筑文物记录</title>
        <style>${styles}</style>
      </head>
      <body>
        <h1>古建筑文物记录</h1>
        <div class="table-container">
          <table>
            <col><col><col><col><col><col><col>
            <thead>
              <tr>
                <th>编号</th>
                <th>景点名称</th>
                <th>景点区域</th>
                <th>具体名称</th>
                <th>具体类型</th>
                <th>照片</th>
                <th>数量</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </body>
      </html>`;

    try {
      // 设置标准A4尺寸（595x842点，即210x297毫米）
      const { uri } = await Print.printToFileAsync({
        html: htmlContent, 
        base64: false,
        width: 595,   // A4宽度（点）
        height: 842,  // A4高度（点）
        orientation: Print.Orientation.portrait
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: '分享您的古建筑文物记录' });
      } else {
        Alert.alert('成功', `PDF 已生成到: ${uri}`);
      }
    } catch (error) {
      console.error('PDF生成错误:', error);
      Alert.alert('错误', '生成 PDF 失败: ' + (error.message || '未知错误'));
    }
  };

  const recordsToShow = useMemo(() => 
    filteredRecords.slice(0, visibleCount),
    [filteredRecords, visibleCount]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity style={styles.cancelButton} onPress={exitSelectionMode}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.selectionCountText}>已选择 {selectedIds.length} 项</Text>
            <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
              <Text style={styles.selectAllButtonText}>
                {selectedIds.length === recordsToShow.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.invertSelectionButton} onPress={handleInvertSelection}>
              <Text style={styles.invertSelectionButtonText}>反选</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteSelectedButton} onPress={handleDeleteSelected}>
              <Text style={styles.deleteSelectedButtonText}>删除</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>总数据量: {filteredRecords.length}</Text>
          <View style={styles.pageSizeContainer}>
            <TouchableOpacity 
              style={styles.pageSizeButton} 
              onPress={() => setShowPageSizeOptions(!showPageSizeOptions)}
            >
              <Text style={styles.pageSizeButtonText}>每页显示: {itemsPerPage}</Text>
            </TouchableOpacity>
            {showPageSizeOptions && (
              <View style={styles.pageSizeOptions}>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <TouchableOpacity 
                    key={option}
                    style={styles.pageSizeOption}
                    onPress={() => handlePageSizeChange(option)}
                  >
                    <Text style={styles.pageSizeOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
              onLongPress={() => handleLongPress(item.id)}
              isSelected={selectedIds.includes(item.id)}
              isSelectionMode={isSelectionMode}
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  pageSizeContainer: {
    position: 'relative',
  },
  pageSizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageSizeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  pageSizeOptions: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
  },
  pageSizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  pageSizeOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectionCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectAllButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteSelectedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f44336',
    borderRadius: 6,
  },
  deleteSelectedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  invertSelectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  invertSelectionButtonText: {
    color: '#333',
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