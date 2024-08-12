import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import client from "../backend/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { createAndSharePDF } from "../services/pdfGenerator.service";

const { width } = Dimensions.get("window");

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const userId = await AsyncStorage.getItem("loggedInUserID");
        let userData;
        if (userId) {
          const response = await client.get(`/user/${userId}`);
          userData = response.data;
        } else {
          const guestId = await AsyncStorage.getItem("guestId");
          const response = await client.get(`/guest/user/${guestId}`);
          userData = response.data;
        }
        setCases(userData.cases);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const renderCase = ({ item, index }) => (
    <Shadow distance={5} startColor="rgba(0, 0, 0, 0.1)" offset={[0, 3]}>
      <View style={styles.caseContainer}>
        <LinearGradient
          colors={["#3A1C71", "#D76D77", "#FFAF7B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.caseGradient}
        >
          <View style={styles.caseContent}>
            <View style={styles.caseHeader}>
              <Text style={styles.caseNumber}>Case #{index + 1}</Text>
              <Text style={styles.caseDate}>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.vehicleInfoContainer}>
              <MaterialCommunityIcons name="car" size={24} color="#fff" />
              <Text style={styles.caseVehicleNumber}>{item.vehicleNumber}</Text>
            </View>
            <Image
              source={{
                uri:
                  item.damagePhotos && item.damagePhotos.length > 0
                    ? item.damagePhotos[0].damagePhoto1
                    : item.documents[0].driversLicense,
              }}
              style={styles.caseImage}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("Case Details", { caseId: item._id })
                }
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => createAndSharePDF(item)}
              >
                <Feather name="share" size={20} color="#fff" />
                <Text style={styles.buttonText}>Share PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Shadow>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Cases</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#D76D77" />
      ) : (
        <FlatList
          data={cases}
          renderItem={renderCase}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 16,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  caseContainer: {
    marginBottom: 16,
    borderRadius: 12,
    width: width - 32, // Full width minus padding
  },
  caseGradient: {
    borderRadius: 12,
  },
  caseContent: {
    padding: 16,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caseNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  caseDate: {
    fontSize: 14,
    color: "#fff",
  },
  vehicleInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  caseVehicleNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  caseImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.48, // This makes the buttons almost as wide as the card
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default MyCases;
