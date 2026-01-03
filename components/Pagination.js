import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.disabledButton]}
        onPress={handlePrev}
        disabled={currentPage === 1}
      >
        <Text style={styles.buttonText}>上一页</Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        第 {currentPage} 页 / 共 {totalPages} 页
      </Text>
      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.disabledButton]}
        onPress={handleNext}
        disabled={currentPage === totalPages}
      >
        <Text style={styles.buttonText}>下一页</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  pageInfo: {
    fontSize: 16,
    color: '#333',
  },
});

export default Pagination;
