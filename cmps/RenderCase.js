import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const RenderCase = ({ item, handleDocumentUpload }) => {
  return (
    <View>
      <Text style={styles.headerText}>Third party details</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Feather name="user" size={24} color="#F7706EFF" />
          <Text style={styles.detailsText}>{item.ID_uesr}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Feather name="upload" size={24} color="#F7706EFF" />
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDocumentUpload()}
          >
            <Text style={styles.detailsText}>THE DRIVER'S VEHICLE LICENSE</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.nextText}>NEXT TO MY DETAILS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    marginVertical: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsText: {
    marginLeft: 8,
  },
  nextText: {
    marginTop: 16,
  },
});

export default RenderCase;
