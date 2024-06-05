import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Swiper from "react-native-swiper";
import { createCaseService } from "../services/createCase.service";

const DamageAssessmentScreen = ({ route, navigation }) => {
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));

  const {
    ID_user,
    Phone_number,
    Vehicle_number,
    License_number,
    Vehicle_model,
    documents,
  } = route.params;

  const handlePhotoUpload = async (index) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setDamagePhotos((prevPhotos) => {
          const newPhotos = [...prevPhotos];
          newPhotos[index] = result.assets[0].uri;
          return newPhotos;
        });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

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

      const response = await createCaseService(data);

      if (response.success) {
        navigation.navigate("Summary", { caseData: data });
      } else {
        console.error("Failed to create case:", response.error);
      }
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  const handleAssessDamage = async () => {
    setProcessing(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000, // 5 seconds
      useNativeDriver: false,
    }).start(() => {
      setProcessing(false);
      setProgress(new Animated.Value(0)); // Reset progress for next use
    });
    // Here you can initiate the backend process
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Damage Assessment</Text>
        </View>

        {[...Array(3)].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoButton}
            onPress={() => handlePhotoUpload(index)}
          >
            <Feather name="camera" size={24} color="#e23680" />
            <Text style={styles.photoButtonText}>
              {damagePhotos[index] ? "Change Photo" : "Upload Damage Photo"}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.photoPreviewContainer}>
          {damagePhotos.map((photoUri, index) => (
            <Image
              key={index}
              source={{ uri: photoUri }}
              style={styles.photoPreview}
            />
          ))}
        </View>

        <Swiper
          style={styles.wrapper}
          showsButtons={true}
          loop={false}
          height={180}
          containerStyle={styles.swiperContainer}
          dotStyle={styles.dotStyle}
          activeDotStyle={styles.activeDotStyle}
          nextButton={<Text style={styles.swiperButton}>›</Text>}
          prevButton={<Text style={styles.swiperButton}>‹</Text>}
        >
          {[
            "THE DRIVER'S LICENCE",
            "THE DRIVER'S VEHICLE LICENSE",
            "INSURANCE",
            "REGISTRATION",
            "ADDITIONAL DOCUMENT",
          ].map((docType) => (
            <View style={styles.slide} key={docType}>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handleDocumentUpload(docType)}
              >
                {documents[docType] ? (
                  <Image
                    source={{ uri: documents[docType] }}
                    style={styles.documentImage}
                  />
                ) : (
                  <>
                    <Feather
                      name="upload"
                      size={24}
                      color="#e23680"
                      style={styles.uploadIcon}
                    />
                    <Text style={styles.documentButtonText}>{docType}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </Swiper>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAssessDamage}
          disabled={processing}
        >
          <Text style={styles.submitButtonText}>
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
    justifyContent: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F6FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 8,
  },
  photoButtonText: {
    color: "#e23680",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  photoPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 8,
  },
  swiperContainer: {
    height: 180,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  documentButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
  },
  documentButtonText: {
    color: "#e23680",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  uploadIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  documentImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  dotStyle: {
    backgroundColor: "#e23680",
    marginBottom: -20,
  },
  activeDotStyle: {
    backgroundColor: "#e23680",
    marginBottom: -20,
  },
  swiperButton: {
    color: "#e23680",
    fontSize: 50,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DamageAssessmentScreen;
