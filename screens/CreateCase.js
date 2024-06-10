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
  Alert,
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
  const [uploadedFirstPhoto, setUploadedFirstPhoto] = useState(false);

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
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

  const handleDocumentUpload = async (docType) => {
    const hasPermissions = await requestPermissions();

    if (!hasPermissions) {
      Alert.alert(
        "Permission required",
        "Please allow camera and media library permissions in your settings."
      );
      return;
    }

    Alert.alert(
      "Upload Document",
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
              setDocuments((prevDocuments) => ({
                ...prevDocuments,
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
              setDocuments((prevDocuments) => ({
                ...prevDocuments,
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              <Text style={{ color: "#e23680" }}>Third party</Text> details
            </Text>
          </View>

          <Text>ID</Text>
          <TextInput
            style={styles.input}
            value={ID_user}
            onChangeText={setID_user}
            keyboardType="numeric"
          />

          <Text>Phone number</Text>
          <TextInput
            style={styles.input}
            value={Phone_number}
            onChangeText={setPhone_number}
            keyboardType="numeric"
          />

          <Text>Vehicle number</Text>
          <TextInput
            style={styles.input}
            value={Vehicle_number}
            onChangeText={setVehicle_number}
            keyboardType="numeric"
          />

          <Text>License number</Text>
          <TextInput
            style={styles.input}
            value={License_number}
            onChangeText={setLicense_number}
            keyboardType="numeric"
          />

          <Text>Vehicle model</Text>
          <TextInput
            style={styles.input}
            value={Vehicle_model}
            onChangeText={setVehicle_model}
          />

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
                ["THE DRIVER'S LICENCE", "THE DRIVER'S VEHICLE LICENSE"],
                ["INSURANCE", "REGISTRATION"],
                ["ADDITIONAL DOCUMENT"],
              ].map((docPair, index) => (
                <View style={styles.slide} key={`pair-${index}`}>
                  {docPair.map((docType) => (
                    <TouchableOpacity
                      style={styles.documentButton}
                      key={docType}
                      onPress={() => handleDocumentUpload(docType)}
                    >
                      {documents[docType] ? (
                        <Image
                          source={{ uri: documents[docType] }}
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
                            {docType}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </Swiper>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !ID_user ||
              !Phone_number ||
              !Vehicle_number ||
              !License_number ||
              !Vehicle_model
                ? styles.disabledButton
                : null,
            ]}
            onPress={navigateToDamageAssessment}
            disabled={
              !ID_user ||
              !Phone_number ||
              !Vehicle_number ||
              !License_number ||
              !Vehicle_model
            }
          >
            <Text style={styles.submitButtonText}>UPLOAD YOUR VEHICLE</Text>
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
    flexGrow: 1,
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
  input: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  errorInput: {
    borderColor: "#e23680",
  },
  errorText: {
    color: "#e23680",
    fontSize: 12,
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#e23680",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateCase;
