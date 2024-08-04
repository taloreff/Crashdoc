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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import client from "../backend/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const userId = await AsyncStorage.getItem("loggedInUserID");
        if (userId) {
          var { data: userData } = await client.get(`/user/${userId}`);
        }
        else {
          const guestId = await AsyncStorage.getItem("guestId");
          var { data: userData } = await client.get(`/guest/user/${guestId}`);
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
    <Shadow distance={5} startColor="rgba(0, 0, 0, 0.05)" offset={[0, 5]}>
      <View style={styles.caseContainer}>
        <LinearGradient
          colors={["#FF6B6B", "#E93382"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.caseNumberContainer}
        >
          <Text style={styles.caseNumber}>{index + 1}</Text>
        </LinearGradient>
        <View style={styles.caseContent}>
          <View style={styles.caseHeader}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={18}
              color="#666"
            />
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
          <View style={styles.caseHeader}>
            <MaterialCommunityIcons name="car" size={18} color="#666" />
            <Text style={styles.caseVehicleNumber}>{item.vehicleNumber}</Text>
          </View>
          {item.damagePhotos && item.damagePhotos.length > 0 && (
            <Image
              source={{ uri: item.damagePhotos[0].damagePhoto1 }}
              style={styles.caseImage}
            />
          )}
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() =>
              navigation.navigate("Case Details", { caseId: item._id })
            }
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Shadow>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#E93382" />
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
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  caseContainer: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    width: width - 32, // Full width with padding
    alignSelf: "center",
  },
  caseContent: {
    padding: 16,
  },
  caseNumberContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  caseNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  caseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  caseDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  caseVehicleNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  caseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  viewDetailsButton: {
    backgroundColor: "#E93382",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 12,
  },
  viewDetailsText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MyCases;
