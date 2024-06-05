import React, { useContext, useEffect } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ProfileContext } from "./ProfileContext";
import avatarImage from "../assets/avatar.jpg";
import TopNavigation from "./TopNavigation";

export default function HeaderComponent({ navigation }) {
  const { profilePic } = useContext(ProfileContext);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.profilePicContainer}
        onPress={() => navigation.navigate("Profile Details")}
      >
        <Image
          source={profilePic ? { uri: profilePic } : avatarImage}
          style={styles.profilePic}
        />
      </TouchableOpacity>
      <TopNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    paddingRight: 0,
    paddingLeft: 15,
    backgroundColor: "#E93382",
    zIndex: 100,
  },
  profilePicContainer: {
    marginRight: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
