import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import RecordCard from './RecordCard';
import Pagination from './Pagination';

const RecordList = ({
  records,
  onDeleteRecord,
  onGeneratePDF,
  totalRecords,
  recordsPerPage,
  currentPage,
  onPageChange,
}) => {
  if (records.length === 0 && totalRecords === 0) {
    return null; // Don't render anything if there are no records
  }

  return (
    <View style={styles.sectionList}>
      <Text style={styles.sectionTitle}>📋 已录入数据</Text>
      {records.length > 0 ? (
        <FlatList
          data={records}
          scrollEnabled={false} // Important for nesting in a ScrollView
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecordCard item={item} onDelete={onDeleteRecord} />
          )}
        />
      ) : (
        <Text style={styles.noRecordsText}>当前页无数据</Text>
      )}
      <Pagination
        totalItems={totalRecords}
        itemsPerPage={recordsPerPage}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      <TouchableOpacity
        style={[styles.button, styles.pdfButton]}
        onPress={onGeneratePDF}
      >
        <Text style={styles.buttonTextLarge}>📄 生成 PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
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
  pdfButton: {
    backgroundColor: '#2196F3',
    marginTop: 15,
    paddingVertical: 14,
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordList;
