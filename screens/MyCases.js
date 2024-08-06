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
import { PDFDocument, StandardFonts } from 'pdf-lib';
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

  async function fetchImageAsArrayBuffer(imageUrl) {
    console.log("IMAGE URL", imageUrl);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;  // Re-throw to handle it in the calling function
    }
  }

  const createPDFAndShare = async (caseItem) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 1000]); // Increase height as needed
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Fetch and embed the logo
      const logoUrl = 'https://res.cloudinary.com/dd7nwvjli/image/upload/v1722956071/glnuan24jxpdjzpclak1.jpg';
      const logoImageBytes = await fetchImageAsArrayBuffer(logoUrl);
      const logoImage = await pdfDoc.embedJpg(logoImageBytes);

      // Draw the logo in the top right corner
      page.drawImage(logoImage, {
        x: page.getWidth() - 220, // Adjust according to your layout needs
        y: page.getHeight() - 120, // Adjust according to your layout needs
        width: 200,
        height: 100
      });

      const drawBoldText = (text, x, y, size) => {
        page.drawText(text, { x, y, size, font: helveticaBold });
      };

      const drawText = (text, x, y, size) => {
        page.drawText(text, { x, y, size, font: helvetica });
      };

      // Draw Image
      const drawImage = async (imageUrl, x, y, width, height) => {
        if (!imageUrl) {
          console.log("Attempted to load an image with an empty URL");
          return;
        }
        try {
          const imageBytes = await fetchImageAsArrayBuffer(imageUrl);

          // Check if the image is JPEG or PNG
          let image;
          if (imageUrl.endsWith('.png')) {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
            image = await pdfDoc.embedJpg(imageBytes);
          } else {
            console.warn(`Unsupported image format for URL: ${imageUrl}`);
            return;
          }

          page.drawImage(image, { x, y, width, height });
        } catch (error) {
          console.error(`Failed to load image from URL: ${imageUrl}`, error);
        }
      };

      // Layout setup
      let yPos = 950; // Initial y position for the page
      const initialXPos = 50; // Starting x position for the first image
      const imageWidth = 100;
      const imageHeight = 100;
      const xSpacing = 120; // Space between images horizontally
      const ySpacing = 120; // Space between rows of images

      // Title
      drawBoldText('My Case', 50, yPos, 24);
      yPos -= 40;

      // User Information
      drawBoldText('User Information:', 50, yPos, 16);
      yPos -= 20;
      const userInfo = [
        { label: 'User ID', value: caseItem.userInfo.userId },
        { label: 'Phone Number', value: caseItem.userInfo.phoneNumber },
        { label: 'Vehicle Number', value: caseItem.userInfo.vehicleNumber },
        { label: 'License Number', value: caseItem.userInfo.licenseNumber },
        { label: 'Vehicle Model', value: caseItem.userInfo.vehicleModel }
      ];

      userInfo.forEach((info) => {
        drawText(`${info.label}: ${info.value || 'N/A'}`, 60, yPos, 12);
        yPos -= 15;
      });
      yPos -= 10;

      // User Documents
      drawBoldText('Documents:', 50, yPos, 16);
      yPos -= 20;
      if (caseItem.userInfo && caseItem.userInfo.documents) {
        let xPos = initialXPos;
        let imageCount = 0;
        for (const [key, docUrl] of Object.entries(caseItem.userInfo.documents)) {
          if (key === '_id' || !docUrl) continue;
          await drawImage(docUrl, xPos, yPos - imageHeight, imageWidth, imageHeight);
          xPos += xSpacing;
          imageCount++;
          if (imageCount % 4 === 0) { // Move to the next row after 4 images
            xPos = initialXPos;
            yPos -= ySpacing;
          }
        }
        if (imageCount % 4 !== 0) {
          yPos -= ySpacing; // Move to the next section if there are remaining images
        }
      }

      // Third Party Information
      yPos -= 60;
      drawBoldText('Third Party Information:', 50, yPos, 16);
      const thirdPartyInfo = [
        { label: 'Third Party ID', value: caseItem.thirdPartyId },
        { label: 'Phone Number', value: caseItem.phoneNumber },
        { label: 'Vehicle Number', value: caseItem.vehicleNumber },
        { label: 'License Number', value: caseItem.licenseNumber },
        { label: 'Vehicle Model', value: caseItem.vehicleModel }
      ];

      thirdPartyInfo.forEach((info) => {
        drawText(`${info.label}: ${info.value || 'N/A'}`, 60, yPos, 12);
        yPos -= 15;
      });
      yPos -= 10;

      // Third Party Documents
      drawBoldText('Documents:', 50, yPos, 16);
      yPos -= 20;
      if (caseItem.documents) {
        let xPos = initialXPos;
        let imageCount = 0;
        for (const [key, docUrl] of Object.entries(caseItem.documents[0])) {
          if (key === '_id' || !docUrl) continue;
          await drawImage(docUrl, xPos, yPos - imageHeight, imageWidth, imageHeight);
          xPos += xSpacing;
          imageCount++;
          if (imageCount % 4 === 0) {
            xPos = initialXPos;
            yPos -= ySpacing;
          }
        }
        if (imageCount % 4 !== 0) {
          yPos -= ySpacing;
        }
      }

      // Damage Photos
      drawBoldText('Damage Photos:', 50, yPos, 16);
      yPos -= 20;
      if (caseItem.damagePhotos) {
        let xPos = initialXPos;
        let imageCount = 0;
        for (const [key, photoUrl] of Object.entries(caseItem.damagePhotos[0])) {
          if (key === '_id' || !photoUrl) continue;
          await drawImage(photoUrl, xPos, yPos - imageHeight, imageWidth, imageHeight);
          xPos += xSpacing;
          imageCount++;
          if (imageCount % 4 === 0) {
            xPos = initialXPos;
            yPos -= ySpacing;
          }
        }
        if (imageCount % 4 !== 0) {
          yPos -= ySpacing;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;
      await FileSystem.writeAsStringAsync(pdfPath, Buffer.from(pdfBytes).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this platform');
        return;
      }

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
