import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import loginSignupService from "../services/loginSignup.service.js";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    console.log("Signing up:", username, email, password);
    const result = await loginSignupService.signup(username, email, password);
    setLoading(false);

    if (result.success) {
      navigation.navigate("Onboarding");
    } else {
      console.error("Error signing up:", result.error);
    }
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 200 : 0}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.content}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Sign up</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="user" size={22} color="black" />
              </View>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder="Enter your user name"
                placeholderTextColor="#7C808D"
                selectionColor="#3662AA"
                onChangeText={setUsername}
                value={username}
              />
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="mail" size={22} color="black" />
              </View>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder="Enter your email address"
                keyboardType="email-address"
                placeholderTextColor="#7C808D"
                selectionColor="#3662AA"
                onChangeText={setEmail}
                value={email}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.icon}>
                <Feather name="lock" size={22} color="black" />
              </View>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder="Enter your password"
                placeholderTextColor="#7C808D"
                selectionColor="#3662AA"
                secureTextEntry={!passwordIsVisible}
                onChangeText={setPassword}
                value={password}
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
            {loading && (
              <ActivityIndicator
                size="large"
                color="#f7706d"
                style={{ marginTop: 20 }}
              />
            )}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signupButtonText}>Create your account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 150,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
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
  input: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 0,
  },
  passwordVisibleButton: {
    position: "absolute",
    right: 10,
  },
  signupButton: {
    backgroundColor: "#E93382",
    width: "80%",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 30,
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SignUpScreen;
