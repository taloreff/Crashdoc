import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadService } from "./upload.service.js";
import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";

async function loadLocalImageAsBase64() {
  const asset = Asset.fromModule(require("../assets/avatar.jpg"));
  await asset.downloadAsync();
  return readAsStringAsync(asset.localUri, { encoding: "base64" });
}

const login = async (email, password) => {
  try {
    const response = await client.post("/user/login", { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("loggedInUserID", user._id);
    return { token, user };
  } catch (error) {
    throw error;
  }
};

const guestLogin = async () => {
  try {
    const response = await client.post("/guest/user");
    const { token, user } = response.data;
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("guestId", user._id);
    const guestId = await AsyncStorage.getItem("guestId");
    return { token, user };
  } catch (error) {
    throw error;
  }
};

const signup = async (username, email, password) => {
  try {
    const base64Img = await loadLocalImageAsBase64();
    const imageDataURI = `data:image/jpg;base64,${base64Img}`;

    const { url: defaultAvatarUrl } = await uploadService.uploadImg(
      imageDataURI
    );

    const response = await client.post("/user", {
      username,
      email,
      password,
      image: defaultAvatarUrl,
    });

    const { token, user } = response.data;
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("loggedInUserID", user._id);
    return { success: true, user };
  } catch (error) {
    console.error("Error signing up:", error.message);
    return { success: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("loggedInUserID");
    await AsyncStorage.removeItem("guestId");
  } catch (error) {
    throw error;
  }
};

const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token !== null;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

export default {
  login,
  signup,
  logout,
  isLoggedIn,
  guestLogin,
};
