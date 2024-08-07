import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import { Feather } from "@expo/vector-icons";
import { onboardingService } from "../services/onboarding.service";
import { createCaseService } from "../services/createCase.service";
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from 'buffer';

const ReviewCase = ({ route, navigation }) => {
  const [userOnboardingInfo, setUserOnboardingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    userId,
    thirdPartyId,
    phoneNumber,
    vehicleNumber,
    licenseNumber,
    vehicleModel,
    documents,
    guestPhoneNumber,
    guestVehicleNumber,
    guestLicenseNumber,
    guestVehicleModel,
    guestDocuments,
    damagePhotos,
    assessmentResult,
  } = route.params;

  useEffect(() => {
    if (!guestPhoneNumber) fetchOnboardingInfo();
    else {
      setLoading(false);
    }
  }, []);

  const fetchOnboardingInfo = async () => {
    try {
      const onboardingInfo = await onboardingService.getOnboardingInfo();
      setUserOnboardingInfo(onboardingInfo);
    } catch (error) {
      console.error("Error fetching onboarding info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSubmit = async () => {
    try {
      let data;
      if (guestPhoneNumber) {
        data = {
          userId,
          guestPhoneNumber,
          guestVehicleNumber,
          guestLicenseNumber,
          guestVehicleModel,
          guestDocuments,
          thirdPartyId,
          phoneNumber,
          vehicleNumber,
          licenseNumber,
          vehicleModel,
          documents,
          damagePhotos,
        };
      } else {
        data = {
          userInfo: userOnboardingInfo,
          thirdPartyId,
          phoneNumber,
          vehicleNumber,
          licenseNumber,
          vehicleModel,
          documents,
          damagePhotos,
        };
      }

      await createCaseService.handleCasePress(data);

      navigation.navigate("Home Page");
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  async function fetchImageAsArrayBuffer(imageUrl) {
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

  const createPDFAndShare = async () => {
    var caseItem;
    if (guestPhoneNumber) {
      caseItem = {
        userId,
        guestPhoneNumber,
        guestVehicleNumber,
        guestLicenseNumber,
        guestVehicleModel,
        guestDocuments,
        thirdPartyId,
        phoneNumber,
        vehicleNumber,
        licenseNumber,
        vehicleModel,
        documents,
        damagePhotos,
      };
    } else {
      caseItem = {
        userInfo: userOnboardingInfo,
        thirdPartyId,
        phoneNumber,
        vehicleNumber,
        licenseNumber,
        vehicleModel,
        documents,
        damagePhotos,
      };
    }
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

      yPos -= 20;
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
        for (const [key, docUrl] of Object.entries(caseItem.documents)) {
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
      yPos -= 60;

      drawBoldText('Damage Photos:', 50, yPos, 16);
      yPos -= 20;
      if (caseItem.damagePhotos) {
        let xPos = initialXPos;
        let imageCount = 0;
        for (const [key, photoUrl] of Object.entries(caseItem.damagePhotos)) {
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

  const renderDetails = (details, title) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{details.userId}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <Text style={styles.value}>{details.phoneNumber}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vehicle Number</Text>
        <Text style={styles.value}>{details.vehicleNumber}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>License Number</Text>
        <Text style={styles.value}>{details.licenseNumber}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vehicle Model</Text>
        <Text style={styles.value}>{details.vehicleModel}</Text>
      </View>
    </>
  );

  const renderSwiperContent = (items, title) => (
    <View style={styles.swiperContainer}>
      <Text style={styles.swiperTitle}>{title}</Text>
      <Swiper
        style={styles.wrapper}
        showsButtons={true}
        loop={false}
        containerStyle={styles.swiperInnerContainer}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        nextButton={<Text style={styles.swiperButton}>›</Text>}
        prevButton={<Text style={styles.swiperButton}>‹</Text>}
        paginationStyle={styles.paginationStyle}
      >
        {items.map((item, index) => (
          <View style={styles.slide} key={index}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </Swiper>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E93382" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {userOnboardingInfo
        ? renderDetails(userOnboardingInfo, "User Information")
        : renderDetails(
          {
            userId,
            phoneNumber: guestPhoneNumber,
            vehicleNumber: guestVehicleNumber,
            licenseNumber: guestLicenseNumber,
            vehicleModel: guestVehicleModel,
          },
          "Guest Information"
        )}
      {renderDetails(
        {
          userId: thirdPartyId,
          phoneNumber: phoneNumber,
          vehicleNumber: vehicleNumber,
          licenseNumber: licenseNumber,
          vehicleModel: vehicleModel,
        },
        "Third Party Information"
      )}

      {userOnboardingInfo
        ? renderSwiperContent(
          Object.values(userOnboardingInfo.documents),
          "User Documents"
        )
        : renderSwiperContent(Object.values(guestDocuments), "Guest Documents")}
      {renderSwiperContent(Object.values(documents), "Third Party Documents")}
      {renderSwiperContent(Object.values(damagePhotos), "Damage Photos")}

      {assessmentResult && (
        <View style={styles.assessmentResultContainer}>
          <Text style={styles.assessmentResultTitle}>Assessment Result</Text>
          {typeof assessmentResult === "string" ? (
            <Text>{assessmentResult}</Text>
          ) : (
            assessmentResult
          )}
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleCaseSubmit}>
        <Text style={styles.submitButtonText}>Submit Case</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton} onPress={createPDFAndShare}>
        <Feather name="share" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#E93382",
  },
  fieldContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  swiperContainer: {
    marginVertical: 20,
  },
  swiperTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#E93382",
  },
  swiperInnerContainer: {
    height: 250,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: 230,
    borderRadius: 8,
  },
  dotStyle: {
    backgroundColor: "rgba(0,0,0,.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDotStyle: {
    backgroundColor: "#E93382",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swiperButton: {
    color: "#E93382",
    fontSize: 40,
    fontWeight: "bold",
  },
  paginationStyle: {
    bottom: 10,
  },
  assessmentResultContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
  },
  assessmentResultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#E93382",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareButton: {
    backgroundColor: "#007386",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginBottom: 60,
    flexDirection: "row",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ReviewCase;
