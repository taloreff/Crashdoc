import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import * as ImagePicker from "expo-image-picker";
import TopNavigation from "../cmps/TopNavigation";
import client from "../backend/api/client";
import { uploadService } from "../services/upload.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileContext } from "../cmps/ProfileContext";
import {
  validateCarNumber,
  validateID,
  validatePhoneNumber,
  validateLicenseNumber,
  validateVehicleModel,
} from "../services/validation.service";
import avatarImg from "../assets/avatar.jpg";

const ProfileScreen = ({ navigation }) => {
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setProfilePic } = useContext(ProfileContext);

  // New State Variables for Additional Information
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});

  const documentTypeMapping = {
    "DRIVER LICENSE": "driversLicense",
    "VEHICLE LICENSE": "vehicleLicense",
    "INSURANCE": "insurance",
    "REGISTRATION": "registration",
    "ADDITIONAL DOCUMENTS": "additionalDocuments",
  };

  useEffect(() => {
    fetchLoggedInUser();
  }, []);

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleEditProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      setLoggedInUserID(currentLoggedInUserID);
      const userResponse = await client.get(`/user/${currentLoggedInUserID}`);
      const { data } = userResponse;
      console.log("Fetched logged in user:", data);
      setUsername(data.username);
      setEmail(data.email);
      setUserId(data.onboardingInfo.userId || "");
      setPhoneNumber(data.onboardingInfo.phoneNumber || "");
      setVehicleNumber(data.onboardingInfo.vehicleNumber || "");
      setLicenseNumber(data.onboardingInfo.licenseNumber || "");
      setVehicleModel(data.onboardingInfo.vehicleModel || "");
      setProfileImage({ uri: data.image || require("../assets/avatar.jpg") });
      setProfilePic(data.image || require("../assets/avatar.jpg"));
      setDocuments(data.onboardingInfo.documents || {});
    } catch (error) {
      console.error("Error fetching logged in user:", error);
    }
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
              const stateKey = documentTypeMapping[docType];
              setDocuments((prevDocuments) => ({
                ...prevDocuments,
                [stateKey]: result.assets[0].uri,
              }));
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
              const stateKey = documentTypeMapping[docType];
              setDocuments((prevDocuments) => ({
                ...prevDocuments,
                [stateKey]: result.assets[0].uri,
              }));
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

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return (
      cameraStatus.status === "granted" &&
      mediaLibraryStatus.status === "granted"
    );
  };

  const validateFields = () => {
    const newErrors = {};
    if (!validatePhoneNumber(phoneNumber)) newErrors.phoneNumber = "Please enter a valid phone number";
    if (!validateCarNumber(vehicleNumber)) newErrors.vehicleNumber = "Please enter a valid vehicle number";
    if (!validateLicenseNumber(licenseNumber)) newErrors.licenseNumber = "Please enter a valid license number";
    if (!validateVehicleModel(vehicleModel)) newErrors.vehicleModel = "Please enter a valid vehicle model";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );

      // Check if email is changed
      const userResponse = await client.get(`/user/${currentLoggedInUserID}`);
      const { data } = userResponse;

      if (data.email !== email) {
        // Call the new update email endpoint
        await client.put(`/user/update-email/${currentLoggedInUserID}`, {
          email,
        });
      }

      const updatedUser = {
        email,
        username,
        onboardingInfo: {
          userId,
          phoneNumber,
          vehicleNumber,
          licenseNumber,
          vehicleModel,
          documents
        },
        image: profileImage.uri || null,
      };

      // Upload profile image if changed
      if (profileImage.uri !== data.image) {
        const base64Img = `data:image/jpg;base64,${await fetch(profileImage.uri)
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
        const imgData = await uploadService.uploadImg(base64Img);
        updatedUser.image = imgData.secure_url;
      }

      await client.put(`/user/${currentLoggedInUserID}`, updatedUser);

      console.log("Success: Profile updated successfully!");
      setProfilePic(updatedUser.image);
      navigation.navigate("Home Page", { refresh: true });
    } catch (error) {
      console.error("Error updating/creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Image source={profileImage ? profileImage : avatarImg} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handleEditProfileImage}
              >
                <Feather name="edit-3" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="user" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  onChangeText={setUsername}
                  value={username}
                  placeholder="Username"
                />
              </View>
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  selectionColor="#3662AA"
                  onChangeText={setEmail}
                  value={email}
                  placeholder="Email"
                />
              </View>
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="info" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  value={userId}
                  placeholder="Identification Number"
                  disabled={true}
                  editable={false}
                />
              </View>
            </View>
            {/* Additional fields from onboarding */}
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="phone" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  onChangeText={setPhoneNumber}
                  value={phoneNumber}
                  placeholder="Phone Number"
                  keyboardType="numeric"
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="hash" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  onChangeText={setVehicleNumber}
                  value={vehicleNumber}
                  placeholder="Vehicle Number"
                  keyboardType="numeric"
                />
              </View>
              {errors.vehicleNumber && (
                <Text style={styles.errorText}>{errors.vehicleNumber}</Text>
              )}
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="key" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  onChangeText={setLicenseNumber}
                  value={licenseNumber}
                  placeholder="License Number"
                  keyboardType="numeric"
                />
              </View>
              {errors.licenseNumber && (
                <Text style={styles.errorText}>{errors.licenseNumber}</Text>
              )}
            </View>
            <View style={styles.inputEditContainer}>
              <View style={styles.inputContainer}>
                <Feather name="truck" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  selectionColor="#3662AA"
                  onChangeText={setVehicleModel}
                  value={vehicleModel}
                  placeholder="Vehicle Model"
                />
              </View>
              {errors.vehicleModel && (
                <Text style={styles.errorText}>{errors.vehicleModel}</Text>
              )}
            </View>

            {/* Document Uploads */}
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
                  ["DRIVER LICENSE", "VEHICLE LICENSE"],
                  ["INSURANCE", "REGISTRATION"],
                  ["ADDITIONAL DOCUMENTS"],
                ].map((docPair, index) => (
                  <View style={styles.slide} key={`pair-${index}`}>
                    {docPair.map((docType) => (
                      <TouchableOpacity
                        style={styles.documentButton}
                        key={docType}
                        onPress={() => handleDocumentUpload(docType)}
                      >
                        {documents[documentTypeMapping[docType]] ? (
                          <Image
                            source={{
                              uri: documents[documentTypeMapping[docType]],
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
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        <TopNavigation />
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
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e23680",
    borderRadius: 20,
    padding: 8,
  },
  inputEditContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
    borderColor: "gray",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 50,
  },
  errorText: {
    color: "#e23680",
    fontSize: 12,
    marginTop: 4,
  },
  passwordVisibleButton: {
    position: "absolute",
    right: 10,
  },
  documentContainer: {
    marginVertical: 20,
    width: "100%",
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
  updateButton: {
    backgroundColor: "#e23680",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginVertical: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
