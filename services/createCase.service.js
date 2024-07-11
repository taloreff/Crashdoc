import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadService } from "./upload.service.js";

export const createCaseService = {
  handleCasePress: async (data) => {
    const {
      thirdPartyId,
      phoneNumber,
      vehicleNumber,
      licenseNumber,
      vehicleModel,
      documents,
      damagePhotos,
    } = data;
    try {
      const token = await AsyncStorage.getItem("token");
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );

      const { data: userData } = await client.get("/user/" + currentLoggedInUserID, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("userData", userData);

      const postResponse = await client.post(
        "/case",
        {
          userInfo: userData.onboardingInfo,
          thirdPartyId,
          phoneNumber,
          vehicleNumber,
          licenseNumber,
          vehicleModel,
          documents,
          damagePhotos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("post response", postResponse.data);
      const response = await client.get("/user/" + currentLoggedInUserID);
      console.log("USER response", response.data);
      const existingUser = response.data;
      if (existingUser) {
        const updatedUser = {
          ...existingUser,
          cases: [...existingUser.cases, postResponse.data],
        };
        console.log("updatedUser ", updatedUser);
        console.log("loggedinuser", currentLoggedInUserID);
        await client.put(`/user/${currentLoggedInUserID}`, updatedUser);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  },
};
