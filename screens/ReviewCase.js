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
import { PDFDocument } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { onboardingService } from "../services/onboarding.service";
import { createCaseService } from "../services/createCase.service";
import logo from "../assets/logo.png"
import { Buffer } from "buffer";

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

  const createPDFAndShare = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 900]); // Adjusted for content fit

      // Fonts
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      // Headers
      const titleSize = 20;
      const subtitleSize = 15;
      const contentSize = 12;
      const headerY = 850;
      const contentStartY = 820;

      // Title
      page.drawText("My Case", {
        x: 50,
        y: headerY,
        size: titleSize,
        font: timesRomanFont,
      });

      // User Information Section
      const userInfoYStart = contentStartY;
      const labels = ['User ID', 'Phone Number', 'Vehicle Number', 'License Number', 'Vehicle Model'];
      const values = [userId, phoneNumber, vehicleNumber, licenseNumber, vehicleModel];
      labels.forEach((label, i) => {
        page.drawText(`${label}: ${values[i]}`, {
          x: 50,
          y: userInfoYStart - i * 20,
          size: subtitleSize,
          font: timesRomanFont,
        });
      });

      // Documents - Embedding images
      const imageYStart = userInfoYStart - 150;
      if (documents && typeof documents === 'object') {
        for (const [key, doc] of Object.entries(documents)) {
          const img = await pdfDoc.embedJpg(doc); // Assuming JPEG images
          const { width, height } = img.scale(0.5);
          page.drawImage(img, {
            x: 50,
            y: imageYStart - (width + 10),
            width: width,
            height: height
          });
          imageYStart -= (height + 10); // Adjust y position for the next image
        }
      }

      // Damage Photos
      let damagePhotoYStart = imageYStart - 100; // Starting point adjusted for spacing
      if (damagePhotos && typeof damagePhotos === 'object') {
        for (const [key, photo] of Object.entries(damagePhotos)) {
          const img = await pdfDoc.embedJpg(photo); // Assuming JPEG images
          const { width, height } = img.scale(0.5);
          page.drawImage(img, {
            x: 50,
            y: damagePhotoYStart - (width + 10),
            width: width,
            height: height
          });
          damagePhotoYStart -= (height + 10); // Adjust y position for the next image
        }
      }

      // Save the PDF document as bytes
      const pdfBytes = await pdfDoc.save();

      // Define the path for the PDF file
      const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;

      // Write the PDF bytes to the file
      await FileSystem.writeAsStringAsync(pdfPath, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing is not available on this platform");
        return;
      }

      // Share the PDF file
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
      });
    } catch (error) {
      console.error("Error creating PDF:", error);
      Alert.alert("Error", "Failed to create or share PDF. Please try again.");
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
