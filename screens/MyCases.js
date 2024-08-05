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
import { PDFDocument } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from 'buffer';

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

  const createPDFAndShare = async (caseItem) => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 700]); // Increased height for more content

      // User Information
      page.drawText('User Information:', { x: 50, y: 650, size: 20 });

      // Extract user information from caseItem
      const userInfo = caseItem.userInfo || {};

      page.drawText(`User ID: ${userInfo.userId || "N/A"}`, { x: 50, y: 630, size: 15 });
      page.drawText(`Phone Number: ${userInfo.phoneNumber || "N/A"}`, { x: 50, y: 610, size: 15 });
      page.drawText(`Vehicle Number: ${userInfo.vehicleNumber || "N/A"}`, { x: 50, y: 590, size: 15 });
      page.drawText(`License Number: ${userInfo.licenseNumber || "N/A"}`, { x: 50, y: 570, size: 15 });
      page.drawText(`Vehicle Model: ${userInfo.vehicleModel || "N/A"}`, { x: 50, y: 550, size: 15 });
      page.drawText('Documents:', { x: 50, y: 530, size: 15 });

      if (userInfo.documents && typeof userInfo.documents === 'object') {
        Object.entries(userInfo.documents).forEach(([key, value], index) => {
          if (value && key !== "_id") {
            page.drawText(`- ${key}: ${value}`, { x: 60, y: 510 - index * 20, size: 12 });
          }
        });
      }

      // Third Party Information
      const thirdPartyYStart = 430 - (userInfo.documents ? Object.keys(userInfo.documents).length : 0) * 20;
      page.drawText('Third Party Information:', { x: 50, y: thirdPartyYStart, size: 20 });
      page.drawText(`Third Party ID: ${caseItem.thirdPartyId || "N/A"}`, { x: 50, y: thirdPartyYStart - 20, size: 15 });
      page.drawText(`Phone Number: ${caseItem.phoneNumber || "N/A"}`, { x: 50, y: thirdPartyYStart - 40, size: 15 });
      page.drawText(`Vehicle Number: ${caseItem.vehicleNumber || "N/A"}`, { x: 50, y: thirdPartyYStart - 60, size: 15 });
      page.drawText(`License Number: ${caseItem.licenseNumber || "N/A"}`, { x: 50, y: thirdPartyYStart - 80, size: 15 });
      page.drawText(`Vehicle Model: ${caseItem.vehicleModel || "N/A"}`, { x: 50, y: thirdPartyYStart - 100, size: 15 });
      page.drawText('Documents:', { x: 50, y: thirdPartyYStart - 120, size: 15 });

      if (caseItem.documents && Array.isArray(caseItem.documents)) {
        caseItem.documents.forEach((doc, docIndex) => {
          Object.entries(doc).forEach(([key, value], index) => {
            if (value) {
              page.drawText(`- ${key}: ${value}`, { x: 60, y: thirdPartyYStart - 140 - (docIndex * 40) - (index * 20), size: 12 });
            }
          });
        });
      }

      // Damage Photos
      const damagePhotosStart = thirdPartyYStart - 160 - (caseItem.documents ? caseItem.documents.length : 0) * 40;
      page.drawText('Damage Photos:', { x: 50, y: damagePhotosStart, size: 15 });

      if (caseItem.damagePhotos && Array.isArray(caseItem.damagePhotos)) {
        caseItem.damagePhotos.forEach((photo, photoIndex) => {
          Object.entries(photo).forEach(([key, value], index) => {
            if (value) {
              page.drawText(`- ${key}: ${value}`, { x: 60, y: damagePhotosStart - 20 - (photoIndex * 40) - (index * 20), size: 12 });
            }
          });
        });
      }

      // Save the PDF document as bytes
      const pdfBytes = await pdfDoc.save();

      // Convert the PDF bytes to a base64 string
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      // Define the path for the PDF file
      const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;

      // Write the base64 string to the file
      await FileSystem.writeAsStringAsync(pdfPath, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this platform');
        return;
      }

      // Share the PDF file
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      Alert.alert('Error', 'Failed to create or share PDF. Please try again.');
    }
  };

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
          {item.damagePhotos && item.damagePhotos.length > 0 ? (
            <Image
              source={{ uri: item.damagePhotos[0].damagePhoto1 }}
              style={styles.caseImage}
            />
          ) : (
            <Image
              source={{ uri: item.documents[0].driversLicense }}
              style={styles.caseImage}
            />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() =>
                navigation.navigate("Case Details", { caseId: item._id })
              }
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => createPDFAndShare(item)}
            >
              <Feather name="share" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Share PDF</Text>
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  viewDetailsButton: {
    backgroundColor: "#E93382",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: "#fff",
    fontWeight: "bold",
  },
  shareButton: {
    backgroundColor: "#007386",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default MyCases;
