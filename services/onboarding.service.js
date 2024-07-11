import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadService } from "./upload.service.js";

export const onboardingService = {
    handleOnboarding: async (data) => {
        const {
            userId,
            phoneNumber,
            vehicleNumber,
            licenseNumber,
            vehicleModel,
            documents,
        } = data;
        try {
            const token = await AsyncStorage.getItem("token");
            const currentLoggedInUserID = await AsyncStorage.getItem("loggedInUserID");

            // Fetch existing user
            const response = await client.get(`/user/${currentLoggedInUserID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const existingUser = response.data;

            if (existingUser) {
                const updatedUser = {
                    ...existingUser,
                    onboardingInfo: {
                        userId,
                        phoneNumber,
                        vehicleNumber,
                        licenseNumber,
                        vehicleModel,
                        documents,
                    },
                };

                // Update user with onboarding information
                await client.put(`/user/${currentLoggedInUserID}`, updatedUser, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("User onboarding info updated successfully.");
            }
        } catch (error) {
            console.log("Error updating user onboarding info: ", error);
        }
    },
};
