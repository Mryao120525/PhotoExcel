import React, { createContext, useState, useEffect, useRef } from 'react';
import { Alert, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
  const [editingRecordId, setEditingRecordId] = useState(null);
  const isInitialMount = useRef(true);
  
  // --- Data Persistence ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedRecords = await AsyncStorage.getItem('records');
        if (storedRecords !== null) {
          setRecords(JSON.parse(storedRecords));
        }
        const storedHistory = await AsyncStorage.getItem('locationHistory');
        if (storedHistory !== null) {
          setLocationHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error('Failed to load data from storage', e);
        Alert.alert('错误', '加载本地数据失败。');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('records', JSON.stringify(records));
        await AsyncStorage.setItem('locationHistory', JSON.stringify(locationHistory));
      } catch (e) {
        console.error('Failed to save data to storage', e);
      }
    };
    saveData();
  }, [records, locationHistory]);

  // --- Form & CRUD Logic ---
  const clearForm = () => {
    setMajorLocation('');
    setMinorLocation('');
    setSpecificName('');
    setItemName('');
    setQuantity('');
    setPhotos([]);
  };

  const handleStartEdit = (id, scrollRef = null) => {
    const recordToEdit = records.find((r) => r.id === id);
    if (recordToEdit) {
      setMajorLocation(recordToEdit.majorLocation);
      setMinorLocation(recordToEdit.minorLocation);
      setSpecificName(recordToEdit.specificName);
      setItemName(recordToEdit.itemName);
      setQuantity(recordToEdit.quantity);
      setPhotos(recordToEdit.photos);
      setEditingRecordId(id);
      if (scrollRef && scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
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
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('提示', '请拍摄或选择至少一张照片');
      return false;
    }

    const recordData = { majorLocation, minorLocation, specificName, itemName, quantity, photos };

    if (editingRecordId) {
      setRecords(records.map((r) => (r.id === editingRecordId ? { ...r, ...recordData } : r)));
    } else {
      setRecords([...records, { id: Date.now(), ...recordData }]);
    }
    
    if (!locationHistory.includes(minorLocation)) {
      setLocationHistory([...locationHistory, minorLocation]);
    }

    setEditingRecordId(null);
    clearForm();
    Keyboard.dismiss();
    return true;
  };

  const handleDeleteRecord = (id) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          if (id === editingRecordId) {
            handleCancelEdit();
          }
          setRecords(records.filter((r) => r.id !== id));
        },
      },
    ]);
  };
  
  const value = {
    // State
    majorLocation, setMajorLocation,
    minorLocation, setMinorLocation,
    specificName, setSpecificName,
    itemName, setItemName,
    quantity, setQuantity,
    photos, setPhotos,
    records, setRecords,
    locationHistory, setLocationHistory,
    editingRecordId, setEditingRecordId,

    // Functions
    handleStartEdit,
    handleCancelEdit,
    handleSaveRecord,
    handleDeleteRecord,
    clearForm,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

