import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const signup = async (username, email, password) => {
  console.log("Signing up:", username, email, password);
  try {
    const response = await client.post("/user", {
      username,
      email,
      password,
    });
    const { token, user } = response.data;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("loggedInUserID", user._id);
    return { success: true };
  } catch (error) {
    console.error("Error signing up:", error.message);
    return { success: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("loggedInUserID");
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
};
