import React, { useState, useRef, useEffect, useContext } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import loginSignupService from "../services/loginSignup.service.js";
import { ProfileContext } from "./ProfileContext.js";
import avatarImage from "../assets/avatar.jpg";

const TopNavigation = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(new Animated.Value(1));
  const navigation = useNavigation();
  const { setProfilePic } = useContext(ProfileContext);

  const handleLogout = async () => {
    try {
      await loginSignupService.logout();
      setShowMenu(false);
      setProfilePic(avatarImage);
      console.log("Logout successful");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handlePressOutsideMenu = () => {
    if (showMenu) {
      setShowMenu(false);
    }
  };

  const handlePanResponderGrant = (e, gestureState) => {
    e.stopPropagation();
  };

  const panResponder = useRef(
    PanResponder.create({
      onPanResponderGrant: handlePanResponderGrant,
    })
  ).current;

  const goToProfileScreen = () => {
    setShowMenu(false);
    navigation.navigate("Profile Details");
  };

  useEffect(() => {
    Animated.timing(menuPosition, {
      toValue: showMenu ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showMenu]);

  return (
    <TouchableWithoutFeedback onPress={handlePressOutsideMenu}>
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleMenu}>
          <View style={styles.icon}>
            <Feather name="menu" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        {showMenu && (
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateY: menuPosition }] },
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity onPress={handleLogout} style={styles.menuAction}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather
                  name="log-out"
                  size={18}
                  color="#E93382"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.menuActionText}>Log Out</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuAction}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather
                  name="file-text"
                  size={18}
                  color="#E93382"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.menuActionText}>My Cases</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToProfileScreen}
              style={styles.menuAction}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather
                  name="user"
                  size={18}
                  color="#E93382"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.menuActionText}>My Profile</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
  },
  menuContainer: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
    maxWidth: 300,
  },
  menuAction: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuActionText: {
    fontSize: 19,
    flex: 1,
    marginLeft: 10,
  },
  menuHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  menuHeaderText: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
});

export default TopNavigation;
