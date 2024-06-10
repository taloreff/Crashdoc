import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import TopNavigation from "../cmps/TopNavigation";
import client from "../backend/api/client";
import { uploadService } from "../services/upload.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileContext } from "../cmps/ProfileContext";

const ProfileScreen = ({ navigation }) => {
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(
    require("../assets/avatar.jpg")
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setProfilePic } = useContext(ProfileContext);

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
      setUsername(data.username);
      setEmail(data.email);
      setProfileImage({ uri: data.image || require("../assets/avatar.jpg") });
      setProfilePic(data.image || require("../assets/avatar.jpg"));
    } catch (error) {
      console.error("Error fetching logged in user:", error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await client.get("/user/email/" + email);
      const existingUser = response.data;
      if (existingUser) {
        const updatedUser = {
          _id: existingUser._id,
          email,
          username,
          password,
          image: profileImage.uri || null,
        };

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

        await client.put(`/user/${loggedInUserID}`, updatedUser);

        console.log("Success: Profile updated successfully!");
        setProfilePic(updatedUser.image);
        navigation.navigate("Home Page", { refresh: true });
      }
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
              <Image source={profileImage} style={styles.profileImage} />
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
                <Feather name="lock" size={22} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#7C808D"
                  selectionColor="#3662AA"
                  onChangeText={setPassword}
                  secureTextEntry={!passwordIsVisible}
                />
                <TouchableOpacity
                  style={styles.passwordVisibleButton}
                  onPress={() => setPasswordIsVisible(!passwordIsVisible)}
                >
                  <Feather
                    name={passwordIsVisible ? "eye" : "eye-off"}
                    size={20}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
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
    bottom: 0,
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
    backgroundColor: "#F3F3F6FF",
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 50,
  },
  passwordVisibleButton: {
    position: "absolute",
    right: 10,
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
