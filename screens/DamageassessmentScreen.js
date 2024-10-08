import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import client from "../backend/api/client";
import { uploadService } from "../services/upload.service";

const DamageAssessmentScreen = ({ route, navigation }) => {
  const [damagePhotos, setDamagePhotos] = useState({});
  const [uploading, setUploading] = useState({});
  const [processing, setProcessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const {
    userId,
    phoneNumber,
    vehicleNumber,
    licenseNumber,
    vehicleModel,
    documents,
    thirdPartyId,
    guestPhoneNumber,
    guestVehicleNumber,
    guestLicenseNumber,
    guestVehicleModel,
    guestDocuments,
  } = route.params;

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
              The assessment indicates that the damage to your vehicle is{" "}
              <Text style={{ fontWeight: "bold" }}>light</Text>. This typically
              includes minor scratches or dents that are superficial and do not
              affect the overall functionality of your vehicle. Based on this
              evaluation, it is generally not recommended to pursue a claim with
              your insurance company as the repair costs are likely to be
              relatively low and might not exceed your deductible.
            </Text>
          );
          break;
        case "2":
          message = (
            <Text>
              The assessment shows that the damage to your vehicle is{" "}
              <Text style={{ fontWeight: "bold" }}>moderate</Text>. This might
              involve issues such as a cracked windshield, minor body damage, or
              other repairs that could be more costly but are still manageable.
              In this case, you might want to consider contacting your insurance
              company to file a claim, as the repair costs could be significant
              enough to warrant it.
            </Text>
          );
          break;
        case "3":
          message = (
            <Text>
              The assessment reveals that the damage to your vehicle is{" "}
              <Text style={{ fontWeight: "bold" }}>severe</Text>. This could
              include major structural damage, extensive bodywork needed, or
              other significant repairs that affect the safety and usability of
              your vehicle. It is imperative that you contact your insurance
              company immediately to file a claim and begin the process of
              getting your vehicle repaired or replaced.
            </Text>
          );
          break;
        default:
          message = (
            <Text>
              The assessment result is{" "}
              <Text style={{ fontWeight: "bold" }}>unknown</Text>. This might
              indicate an error in processing the images or an unexpected type
              of damage that could not be categorized. Please try again.
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

  const handleContinue = () => {
    navigation.navigate("Review Case", {
      userId,
      phoneNumber,
      vehicleNumber,
      licenseNumber,
      vehicleModel,
      documents,
      damagePhotos,
      assessmentResult,
      thirdPartyId,
      guestPhoneNumber,
      guestVehicleNumber,
      guestLicenseNumber,
      guestVehicleModel,
      guestDocuments,
    });
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
              quality: 0.6, // Reduced quality for faster upload
            });

            if (!result.canceled) {
              const imageUri = result.assets[0].uri;
              const photoKey = `damagePhoto${index}`;
              setDamagePhotos((prevPhotos) => ({
                ...prevPhotos,
                [photoKey]: imageUri,
              })); // Display image immediately
              uploadDamagePhoto(photoKey, imageUri); // Upload in the background
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
              quality: 0.6, // Reduced quality for faster upload
            });

            if (!result.canceled) {
              const imageUri = result.assets[0].uri;
              const photoKey = `damagePhoto${index}`;
              setDamagePhotos((prevPhotos) => ({
                ...prevPhotos,
                [photoKey]: imageUri,
              })); // Display image immediately
              uploadDamagePhoto(photoKey, imageUri); // Upload in the background
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

  const uploadDamagePhoto = async (photoKey, imageUri) => {
    setUploading((prevUploading) => ({
      ...prevUploading,
      [photoKey]: true,
    }));

    try {
      const base64Img = await fetch(imageUri)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );

      const uploadedImage = await uploadService.uploadImg(base64Img);
      // Update the state to the uploaded URL
      setDamagePhotos((prevPhotos) => ({
        ...prevPhotos,
        [photoKey]: uploadedImage.secure_url,
      }));
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Failed to upload the image. Please try again."
      );
      console.log("Upload Error:", error);
    } finally {
      setUploading((prevUploading) => ({
        ...prevUploading,
        [photoKey]: false,
      }));
    }
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
          <View style={styles.gridContainer}>
            {/* First row with 3 frames */}
            {[
              "Upload Damage Photo 1",
              "Upload Damage Photo 2",
              "Upload Damage Photo 3",
            ].map((docType, index) => (
              <View style={styles.gridItem} key={index}>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={() => handlePhotoUpload(docType, index + 1)}
                  disabled={uploading[`damagePhoto${index + 1}`]}
                >
                  {uploading[`damagePhoto${index + 1}`] ? (
                    <ActivityIndicator size="small" color="#e23680" />
                  ) : damagePhotos[`damagePhoto${index + 1}`] ? (
                    <Image
                      source={{ uri: damagePhotos[`damagePhoto${index + 1}`] }}
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
              </View>
            ))}

            {/* Second row with 3 frames, middle one is the logo */}
            <View style={styles.gridItem}>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handlePhotoUpload("Upload Damage Photo 4", 4)}
                disabled={uploading["damagePhoto4"]}
              >
                {uploading["damagePhoto4"] ? (
                  <ActivityIndicator size="small" color="#e23680" />
                ) : damagePhotos["damagePhoto4"] ? (
                  <Image
                    source={{ uri: damagePhotos["damagePhoto4"] }}
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
                    <Text style={styles.documentButtonText}>
                      Upload Damage Photo 4
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.gridItemLogo}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={styles.gridItem}>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handlePhotoUpload("Upload Damage Photo 5", 5)}
                disabled={uploading["damagePhoto5"]}
              >
                {uploading["damagePhoto5"] ? (
                  <ActivityIndicator size="small" color="#e23680" />
                ) : damagePhotos["damagePhoto5"] ? (
                  <Image
                    source={{ uri: damagePhotos["damagePhoto5"] }}
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
                    <Text style={styles.documentButtonText}>
                      Upload Damage Photo 5
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={processing}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "29%",
    marginVertical: 6,
    alignItems: "center",
  },
  gridItemLogo: {
    width: "29%",
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 95,
    height: 95,
    borderRadius: 55,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  documentButton: {
    width: 95,
    height: 95,
    borderRadius: 55,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginVertical: 10,
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
    width: 90,
    height: 90,
    borderRadius: 55,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  assessButton: {
    marginTop: 50,
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e23680",
    borderRadius: 44,
    width: "100%",
  },
  assessButtonText: {
    color: "#e23680",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#e23680",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  continueButtonText: {
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
    justifyContent: "center",
  },
  assessmentResultText: {
    fontSize: 18,
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.7)",
  },
});

export default DamageAssessmentScreen;
