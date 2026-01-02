import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState as useStateExpo } from 'react';

export default function App() {
  const [majorLocation, setMajorLocation] = useState('');
  const [minorLocation, setMinorLocation] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photo, setPhoto] = useState(null);
  const [records, setRecords] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);

  // 拍照功能
  const handleTakePhoto = async () => {
    try {
      // 请求相机权限
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('权限被拒绝', '需要相机权限才能拍照。请在设置中开启权限。');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('拍照错误:', error);
      Alert.alert('错误', '拍照失败，请检查设备设置或重试');
    }
  };

  // 从相册选择
  const handlePickPhoto = async () => {
    try {
      // 请求相册权限
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (libraryPermission.status !== 'granted') {
        Alert.alert('权限被拒绝', '需要相册权限才能选择照片。请在设置中开启权限。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择照片错误:', error);
      Alert.alert('错误', '选择照片失败，请重试');
    }
  };

  // 确认添加记录
  const handleAddRecord = () => {
    if (!majorLocation.trim()) {
      Alert.alert('提示', '请输入大地点');
      return;
    }
    if (!minorLocation.trim()) {
      Alert.alert('提示', '请输入小地点');
      return;
    }
    if (!itemName.trim()) {
      Alert.alert('提示', '请输入物品名称');
      return;
    }
    if (!quantity.trim()) {
      Alert.alert('提示', '请输入数量');
      return;
    }
    if (!photo) {
      Alert.alert('提示', '请拍摄或选择照片');
      return;
    }

    // 添加记录
    const newRecord = {
      id: Date.now(),
      majorLocation,
      minorLocation,
      itemName,
      quantity,
      photo,
    };

    setRecords([...records, newRecord]);

    // 更新历史标签（去重）
    if (!locationHistory.includes(minorLocation)) {
      setLocationHistory([...locationHistory, minorLocation]);
    }

    // 只清空物品相关字段，保留地点信息
    setItemName('');
    setQuantity('');
    setPhoto(null);

    Alert.alert('成功', '记录已添加');
  };

  // 点击历史标签，填入小地点
  const handleHistoryTagPress = (tag) => {
    setMinorLocation(tag);
  };

  // 删除记录
  const handleDeleteRecord = (id) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', onPress: () => {} },
      {
        text: '删除',
        onPress: () => {
          setRecords(records.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  // 生成 PDF
  const handleGeneratePDF = async () => {
    if (records.length === 0) {
      Alert.alert('提示', '暂无数据，无法生成 PDF');
      return;
    }

    // 构建 HTML 表格
    let htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: center; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            img { max-width: 100px; max-height: 100px; }
          </style>
        </head>
        <body>
          <h1>巡检录入报告</h1>
          <table>
            <thead>
              <tr>
                <th>大地点</th>
                <th>小地点</th>
                <th>物品名称</th>
                <th>照片</th>
                <th>数量</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (const record of records) {
      const base64Photo = await getBase64FromUri(record.photo);
      htmlContent += `
        <tr>
          <td>${record.majorLocation}</td>
          <td>${record.minorLocation}</td>
          <td>${record.itemName}</td>
          <td><img src="data:image/jpeg;base64,${base64Photo}" /></td>
          <td>${record.quantity}</td>
        </tr>
      `;
    }

    htmlContent += `
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
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('成功', `PDF 已生成到: ${uri}`);
      }
    } catch (error) {
      Alert.alert('错误', '生成 PDF 失败: ' + error.message);
    }
  };

  // 将 URI 转换为 Base64（用于嵌入 PDF）
  const getBase64FromUri = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('转换 Base64 失败:', error);
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 地点设置区域 */}
        <View style={styles.sectionLocation}>
          <Text style={styles.sectionTitle}>📍 地点设置</Text>

          <Text style={styles.label}>大地点（如故宫）</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入大地点"
            placeholderTextColor="#ccc"
            value={majorLocation}
            onChangeText={setMajorLocation}
          />

          <Text style={styles.label}>小地点（如坤宁宫）</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入小地点"
            placeholderTextColor="#ccc"
            value={minorLocation}
            onChangeText={setMinorLocation}
          />

          {/* 历史标签 */}
          {locationHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>快速切换历史小地点：</Text>
              <View style={styles.tagsContainer}>
                {locationHistory.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyTag}
                    onPress={() => handleHistoryTagPress(tag)}
                  >
                    <Text style={styles.historyTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 物品录入区域 */}
        <View style={styles.sectionItem}>
          <Text style={styles.sectionTitle}>📦 物品录入</Text>

          <Text style={styles.label}>物品名称</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入物品名称"
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

          {/* 照片区域 */}
          <Text style={styles.label}>照片</Text>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhoto(null)}
              >
                <Text style={styles.removePhotoText}>✕ 移除</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noPhotoText}>还未选择照片</Text>
          )}

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={handleTakePhoto}
            >
              <Text style={styles.buttonText}>📷 拍照</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={handlePickPhoto}
            >
              <Text style={styles.buttonText}>🖼 相册</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddRecord}
          >
            <Text style={styles.buttonTextLarge}>✓ 确认添加</Text>
          </TouchableOpacity>
        </View>

        {/* 记录列表 */}
        {records.length > 0 && (
          <View style={styles.sectionList}>
            <Text style={styles.sectionTitle}>📋 已录入数据</Text>
            <FlatList
              data={records}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.recordCard}>
                  <View style={styles.recordContent}>
                    <View style={styles.recordRow}>
                      <Text style={styles.recordLabel}>大地点：</Text>
                      <Text style={styles.recordValue}>{item.majorLocation}</Text>
                    </View>
                    <View style={styles.recordRow}>
                      <Text style={styles.recordLabel}>小地点：</Text>
                      <Text style={styles.recordValue}>{item.minorLocation}</Text>
                    </View>
                    <View style={styles.recordRow}>
                      <Text style={styles.recordLabel}>物品：</Text>
                      <Text style={styles.recordValue}>{item.itemName}</Text>
                    </View>
                    <View style={styles.recordRow}>
                      <Text style={styles.recordLabel}>数量：</Text>
                      <Text style={styles.recordValue}>{item.quantity}</Text>
                    </View>
                    {item.photo && (
                      <Image
                        source={{ uri: item.photo }}
                        style={styles.recordPhoto}
                      />
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRecord(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.button, styles.pdfButton]}
              onPress={handleGeneratePDF}
            >
              <Text style={styles.buttonTextLarge}>📄 生成 PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 底部空间 */}
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
  sectionLocation: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
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
  sectionList: {
    marginBottom: 20,
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
  historyContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#90caf9',
  },
  historyTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  historyTagText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
  },
  noPhotoText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 10,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  pdfButton: {
    backgroundColor: '#2196F3',
    marginTop: 15,
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
  recordCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    width: 60,
  },
  recordValue: {
    color: '#666',
    flex: 1,
  },
  recordPhoto: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 30,
  },
});
