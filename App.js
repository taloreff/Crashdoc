import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileProvider } from "./cmps/ProfileContext";
import LoginScreen from "./screens/LoginScreen";
import HomePage from "./screens/HomePage";
import SignUpScreen from "./screens/SignUpScreen";
import CreateCase from "./screens/CreateCase";
import ProfileScreen from "./screens/ProfileScreen";
import DamageassessmentScreen from "./screens/DamageassessmentScreen";
import MyCases from "./screens/MyCases";
import CaseDetails from "./screens/CaseDetails";
import OnboardingScreen from "./screens/OnboardingScreen";
import GuestScreen from "./screens/GuestScreen";
import ReviewCase from "./screens/ReviewCase";

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedInUserID = await AsyncStorage.getItem("loggedInUserID");
        if (loggedInUserID) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <ProfileProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isLoggedIn ? "Home Page" : "Login"}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Sign Up"
            component={SignUpScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Guest Onboarding"
            component={GuestScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Home Page"
            component={HomePage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Create Case"
            component={CreateCase}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Profile Details"
            component={ProfileScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Damage assessment"
            component={DamageassessmentScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Review Case"
            component={ReviewCase}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="My Cases"
            component={MyCases}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Case Details"
            component={CaseDetails}
            options={{ headerTitle: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
}
