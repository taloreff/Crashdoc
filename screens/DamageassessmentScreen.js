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
  Alert, // Add this line
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Swiper from "react-native-swiper";
import { createCaseService } from "../services/createCase.service";

const DamageAssessmentScreen = ({ route, navigation }) => {
  const [damagePhotos, setDamagePhotos] = useState({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [uploadedFirstPhoto, setUploadedFirstPhoto] = useState(false);

  const {
    ID_user,
    Phone_number,
    Vehicle_number,
    License_number,
    Vehicle_model,
    documents,
  } = route.params;

  const handleCaseSubmit = async () => {
    try {
      const data = {
        ID_user,
        Phone_number,
        Vehicle_number,
        License_number,
        Vehicle_model,
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
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      setProcessing(false);
      setProgress(new Animated.Value(0));
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

  const handlePhotoUpload = async (docType) => {
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
                [docType]: result.assets[0].uri,
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
                [docType]: result.assets[0].uri,
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
            ].map((docPair, index) => (
              <View style={styles.slide} key={`pair-${index}`}>
                {docPair.map((docType) => (
                  <TouchableOpacity
                    style={styles.documentButton}
                    key={docType}
                    onPress={() => handlePhotoUpload(docType)}
                  >
                    {damagePhotos[docType] ? (
                      <Image
                        source={{ uri: damagePhotos[docType] }}
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
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e23680",
    borderRadius: 12,
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
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DamageAssessmentScreen;
