import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderComponent from "../cmps/HeaderComponent.js";
import client from "../backend/api/client.js";
import { useFocusEffect } from "@react-navigation/native";
import { ProfileContext } from "../cmps/ProfileContext";
import SOSSlider from "../cmps/SOSSlider";
import { debounce } from "lodash";

const HomePage = ({ navigation }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const { profilePic, setProfilePic } = useContext(ProfileContext);
  const [showSafetyDialog, setShowSafetyDialog] = useState(true);

  useFocusEffect(
    useCallback(() => {
      debouncedFetchLoggedInUserProfilePic();
    }, [loggedInUserID])
  );

  useEffect(() => {
    (async () => {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      setLoggedInUserID(currentLoggedInUserID);
    })();
  }, []);

  const goToCaseScreen = () => {
    navigation.navigate("Create Case");
  };

  const fetchLoggedInUserProfilePic = async () => {
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      setLoggedInUserID(currentLoggedInUserID);
      const userResponse = await client.get(`/user/${currentLoggedInUserID}`);
      const { data } = userResponse;
      setProfilePic(data.image);
    } catch (error) {
      console.error("Error fetching logged in user:", error);
    }
  };

  const debouncedFetchLoggedInUserProfilePic = useCallback(
    debounce(fetchLoggedInUserProfilePic, 300),
    []
  );

  const handleSOS = () => {
    Alert.alert("SOS Triggered!");
  };

  const hideDialog = () => {
    setShowSafetyDialog(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HeaderComponent
          loggedInUserProfilePic={profilePic}
          navigation={navigation}
        />
        <View style={styles.innerContainer}>
          <View style={styles.documentButtonContainer}>
            <Text style={styles.tapBtnText}>Tap to document</Text>
            <TouchableOpacity
              style={styles.documentButton}
              onPress={goToCaseScreen}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          {showSafetyDialog && <View style={styles.safetyDialogContainer}>
            <Text style={styles.safetyText}>Ensure your safety</Text>
            <Text style={styles.safetySubText}>
              By wearing a yellow vest, placing a caution triangle and obeying
              traffic laws
            </Text>
            <TouchableOpacity style={styles.closeDialogButton} onPress={hideDialog}>
              <Text style={styles.closeButtonText}>x</Text>
            </TouchableOpacity>
          </View>}
          <View style={styles.sosSliderContainer}>
            <SOSSlider onSlide={handleSOS} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  documentButtonContainer: {
    alignItems: "center",
  },
  documentButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ff69b4",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 80,
    color: "#fff",
    textAlign: "center",
    lineHeight: 80,
  },
  tapBtnText: {
    fontSize: 16,
    marginBottom: 10,
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  safetyDialogContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  safetyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  safetySubText: {
    fontSize: 14,
    color: "#666",
  },
  closeDialogButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  sosSliderContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
});

export default HomePage;
