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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BottomNavigation from "../cmps/BottomNavigation";
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
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
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
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <Image source={profileImage} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={handleEditProfileImage}
            >
              <View>
                <Feather name="edit-3" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.inputEditContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="user" size={22} color="black" />
              </View>
              <TextInput
                style={styles.input}
                selectionColor="#3662AA"
                onChangeText={setUsername}
                value={username}
              />
            </View>
          </View>
          <View style={styles.inputEditContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="mail" size={22} color="black" />
              </View>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                selectionColor="#3662AA"
                onChangeText={setEmail}
                value={email}
              />
            </View>
          </View>
          <View style={styles.inputEditContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="lock" size={22} color="black" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="********"
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
                  color="black"
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
        <BottomNavigation />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    fontSize: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#F7706EFF",
    borderRadius: 20,
    padding: 8,
  },
  editIcon: {
    fontSize: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 150,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  fieldIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  fieldText: {
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    height: 50,
    borderColor: "gray",
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ff5252",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  showPasswordButton: {
    paddingHorizontal: 8,
  },
  showPasswordIcon: {
    fontSize: 24,
  },
  updateButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 60,
    marginHorizontal: 38,
    flexDirection: "row",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navIcon: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
    marginTop: 10,
    height: 50,
    borderColor: "gray",
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 15,
  },
  inputEditContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  passwordVisibleButton: {
    position: "absolute",
    right: 10,
  },
});

export default ProfileScreen;
