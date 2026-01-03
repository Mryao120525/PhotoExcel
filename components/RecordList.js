import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import RecordCard from './RecordCard';
import Pagination from './Pagination';

const RecordList = ({
  records,
  onDeleteRecord,
  onEditRecord,
  onGeneratePDF,
  totalRecords,
  recordsPerPage,
  currentPage,
  onPageChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const showList = totalRecords > 0;

  return (
    <View style={styles.sectionList}>
      <Text style={styles.sectionTitle}>📋 已录入数据</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="按名称或地点搜索..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={onSearchQueryChange}
      />

      {showList ? (
        <>
          {records.length > 0 ? (
            <FlatList
              data={records}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <RecordCard
                  item={item}
                  onDelete={onDeleteRecord}
                  onEdit={onEditRecord}
                />
              )}
            />
          ) : (
            <Text style={styles.noRecordsText}>没有找到匹配的记录</Text>
          )}
          <Pagination
            totalItems={totalRecords}
            itemsPerPage={recordsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </>
      ) : (
         <Text style={styles.noRecordsText}>还没有任何记录，请添加。</Text>
      )}

      <TouchableOpacity
        style={[styles.button, styles.pdfButton, !showList && styles.disabledButton]}
        onPress={onGeneratePDF}
        disabled={!showList}
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 20,
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordList;
