import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Swiper from "react-native-swiper";

const CreateCase = ({ navigation }) => {
  const [ID_user, setID_user] = useState("");
  const [Phone_number, setPhone_number] = useState("");
  const [Vehicle_number, setVehicle_number] = useState("");
  const [License_number, setLicense_number] = useState("");
  const [Vehicle_model, setVehicle_model] = useState("");
  const [documents, setDocuments] = useState({});

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleDocumentUpload = async (docType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setDocuments({ ...documents, [docType]: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const navigateToDamageAssessment = () => {
    navigation.navigate("Damage assessment", {
      ID_user,
      Phone_number,
      Vehicle_number,
      License_number,
      Vehicle_model,
      documents,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Third party details</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="ID"
            value={ID_user}
            onChangeText={setID_user}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={Phone_number}
            onChangeText={setPhone_number}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Vehicle number"
            value={Vehicle_number}
            onChangeText={setVehicle_number}
          />
          <TextInput
            style={styles.input}
            placeholder="License number"
            value={License_number}
            onChangeText={setLicense_number}
          />
          <TextInput
            style={styles.input}
            placeholder="Vehicle model"
            value={Vehicle_model}
            onChangeText={setVehicle_model}
          />

          <View style={styles.documentContainer}>
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
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={navigateToDamageAssessment}
          >
            <Text style={styles.submitButtonText}>NEXT TO MY DETAILS</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  input: {
    height: 40,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: "#F3F3F6FF",
    padding: 8,
    marginVertical: 8,
  },
  documentContainer: {
    marginVertical: 16,
  },
  wrapper: {},
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

export default CreateCase;
