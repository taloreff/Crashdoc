import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  Animated,
  Alert,
} from "react-native";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Swiper from "react-native-swiper";
import { createCaseService } from "../services/createCase.service";
import client from "../backend/api/client";
import { uploadService } from "../services/upload.service";

const DamageAssessmentScreen = ({ route, navigation }) => {
  const [damagePhotos, setDamagePhotos] = useState({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [uploadedFirstPhoto, setUploadedFirstPhoto] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const {
    thirdPartyId,
    phoneNumber,
    vehicleNumber,
    licenseNumber,
    vehicleModel,
    documents,
  } = route.params;

  const handleCaseSubmit = async () => {
    try {
      const data = {
        thirdPartyId,
        phoneNumber,
        vehicleNumber,
        licenseNumber,
        vehicleModel,
        documents,
        damagePhotos,
      };

      await createCaseService.handleCasePress(data);
      navigation.navigate("Home Page");
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  const handleAssessDamage = async () => {
    setProcessing(true);
    try {
      const photoKeys = Object.keys(damagePhotos);
      const base64Imgs = await Promise.all(
        photoKeys.map(async (key) => {
          const base64Img = `data:image/jpg;base64,${await fetch(
            damagePhotos[key]
          )
            .then((response) => response.blob())
            .then(
              (blob) =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                })
            )}`;
          return base64Img;
        })
      );

      const response = await client.post("/upload", {
        imageUrls: base64Imgs,
      });

      const result = response.data.result;

      let message;
      switch (result) {
        case "1":
          message = (
            <Text>
              The assessment indicates that the damage to your vehicle is <Text style={{ fontWeight: 'bold' }}>light</Text>. This typically includes minor scratches or dents that are superficial and do not affect the overall functionality of your vehicle. Based on this evaluation, it is generally not recommended to pursue a claim with your insurance company as the repair costs are likely to be relatively low and might not exceed your deductible.
            </Text>
          );
          break;
        case "2":
          message = (
            <Text>
              The assessment shows that the damage to your vehicle is <Text style={{ fontWeight: 'bold' }}>moderate</Text>. This might involve issues such as a cracked windshield, minor body damage, or other repairs that could be more costly but are still manageable. In this case, you might want to consider contacting your insurance company to file a claim, as the repair costs could be significant enough to warrant it.
            </Text>
          );
          break;
        case "3":
          message = (
            <Text>
              The assessment reveals that the damage to your vehicle is <Text style={{ fontWeight: 'bold' }}>severe</Text>. This could include major structural damage, extensive bodywork needed, or other significant repairs that affect the safety and usability of your vehicle. It is imperative that you contact your insurance company immediately to file a claim and begin the process of getting your vehicle repaired or replaced.
            </Text>
          );
          break;
        default:
          message = (
            <Text>
              The assessment result is <Text style={{ fontWeight: 'bold' }}>unknown</Text>. This might indicate an error in processing the images or an unexpected type of damage that could not be categorized. Please try again.
            </Text>
          );
      }

      setAssessmentResult(message);
    } catch (error) {
      console.error("Error assessing damage:", error);
      Alert.alert("Error", "Failed to assess damage. Please try again.");
    } finally {
      setProcessing(false);
    }
  };


  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return (
      cameraStatus.status === "granted" &&
      mediaLibraryStatus.status === "granted"
    );
  };

  const handlePhotoUpload = async (docType, index) => {
    const hasPermissions = await requestPermissions();

    if (!hasPermissions) {
      Alert.alert(
        "Permission required",
        "Please allow camera and media library permissions in your settings."
      );
      return;
    }

    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              setDamagePhotos((prevPhotos) => ({
                ...prevPhotos,
                [`damagePhoto${index}`]: result.assets[0].uri,
              }));

              if (!uploadedFirstPhoto) {
                setUploadedFirstPhoto(true);
              }
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              setDamagePhotos((prevPhotos) => ({
                ...prevPhotos,
                [`damagePhoto${index}`]: result.assets[0].uri,
              }));

              if (!uploadedFirstPhoto) {
                setUploadedFirstPhoto(true);
              }
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            <Text style={{ color: "#e23680" }}>Damage</Text> assessment
          </Text>
        </View>

        <View style={styles.documentContainer}>
          <Swiper
            style={styles.wrapper}
            showsButtons={true}
            loop={false}
            height={130}
            containerStyle={styles.swiperContainer}
            dotStyle={styles.dotStyle}
            activeDotStyle={styles.activeDotStyle}
            nextButton={<Text style={styles.swiperButton}>›</Text>}
            prevButton={<Text style={styles.swiperButton}>‹</Text>}
            paginationStyle={styles.paginationStyle}
            horizontal={true}
          >
            {[
              ["Upload Damage Photo 1", "Upload Damage Photo 2"],
              ["Upload Damage Photo 3", "Upload Damage Photo 4"],
              ["Upload Damage Photo 5"],
            ].map((docPair, pairIndex) => (
              <View style={styles.slide} key={`pair-${pairIndex}`}>
                {docPair.map((docType, index) => (
                  <TouchableOpacity
                    style={styles.documentButton}
                    key={docType}
                    onPress={() =>
                      handlePhotoUpload(docType, pairIndex * 2 + index + 1)
                    }
                  >
                    {damagePhotos[`damagePhoto${pairIndex * 2 + index + 1}`] ? (
                      <Image
                        source={{
                          uri: damagePhotos[
                            `damagePhoto${pairIndex * 2 + index + 1}`
                          ],
                        }}
                        style={styles.documentImage}
                      />
                    ) : (
                      <>
                        <View style={styles.uploadIconContainer}>
                          <Feather
                            name="upload"
                            size={18}
                            style={styles.uploadIcon}
                          />
                        </View>
                        <Text style={styles.documentButtonText}>{docType}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </Swiper>
        </View>

        {assessmentResult && (
          <View style={styles.assessmentResultContainer}>
            {assessmentResult}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.assessButton}
            onPress={handleAssessDamage}
            disabled={processing}
          >
            <Text style={styles.assessButtonText}>
              {processing ? "Assessing..." : "Assess the Damage"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCaseSubmit}
            disabled={processing}
          >
            <Text style={styles.submitButtonText}>Submit Case</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  documentContainer: {
    marginVertical: 20,
  },
  swiperContainer: {
    height: 180,
    width: "100%",
  },
  slide: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  documentButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    position: "relative",
  },
  documentButtonText: {
    color: "rgba(0, 0, 0, 0.6)",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  uploadIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e23680",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 2,
    right: 2,
  },
  uploadIcon: {
    color: "#fff",
  },
  documentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  dotStyle: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    bottom: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDotStyle: {
    backgroundColor: "#e23680",
    bottom: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  swiperButton: {
    color: "#e23680",
    fontSize: 40,
    fontWeight: "bold",
  },
  paginationStyle: {
    marginTop: 10,
  },
  assessButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#e23680",
    borderRadius: 44,
  },
  assessButtonText: {
    color: "#e23680",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 18,
    paddingHorizontal: 16,
    margin: 20,
    marginBottom: 70,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 44,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  assessmentResultContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    // height: "75%",
    justifyContent: "center"
  },
  assessmentResultText: {
    fontSize: 18,
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.7)"
  },
});


export default DamageAssessmentScreen;
