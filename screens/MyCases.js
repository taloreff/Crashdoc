import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import client from "../backend/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const userId = await AsyncStorage.getItem("loggedInUserID");
        console.log("Fetching cases for user ID:", userId);
        const response = await client.get(`/case/user/${userId}`);
        console.log("Cases fetched:", response.data);
        setCases(response.data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const renderCase = ({ item, index }) => (
    <View style={styles.caseContainer}>
      <View style={styles.caseNumberContainer}>
        <Text style={styles.caseNumber}>{index + 1}</Text>
      </View>
      <Text style={styles.caseDate}>
        Opened: {new Date(item.createdAt).toLocaleString()}
      </Text>
      <Text style={styles.caseVehicleNumber}>
        Vehicle Number: {item.Vehicle_number}
      </Text>
      {item.damagePhotos.length > 0 && (
        <Image
          source={{ uri: item.damagePhotos[0] }}
          style={styles.caseImage}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#E93382" />
      ) : (
        <FlatList
          data={cases}
          renderItem={renderCase}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  caseContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: "relative",
  },
  caseNumberContainer: {
    backgroundColor: "#E93382",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
    position: "absolute",
    top: -2,
    left: 0,
  },
  caseNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  caseDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  caseVehicleNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  caseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});

export default MyCases;
