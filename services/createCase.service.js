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
      userId,
      guestPhoneNumber,
      guestVehicleNumber,
      guestLicenseNumber,
      guestVehicleModel,
      guestDocuments,
    } = data;
    try {
      const token = await AsyncStorage.getItem("token");
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      const guestId = await AsyncStorage.getItem("guestId");
      let userData;
      if (currentLoggedInUserID) {
        const { data } = await client.get("/user/" + currentLoggedInUserID, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        userData = data
      } else {
        const { data } = await client.get("/guest/user/" + guestId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        userData = data
      }



      const postResponse = await client.post(
        "/case",
        {
          userInfo: userData.onboardingInfo ? userData.onboardingInfo : {
            userId,
            phoneNumber: guestPhoneNumber,
            vehicleNumber: guestVehicleNumber,
            licenseNumber: guestLicenseNumber,
            vehicleModel: guestVehicleModel,
            documents: guestDocuments,
          },
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

      let response
      if (currentLoggedInUserID) {
        response = await client.get("/user/" + currentLoggedInUserID);
      }
      else {
        response = await client.get("/guest/user/" + guestId);
      }
      const existingUser = response.data;
      if (existingUser) {
        const updatedUser = {
          ...existingUser,
          cases: [...existingUser.cases, postResponse.data],
        };
        if (currentLoggedInUserID) {
          await client.put(`/user/${currentLoggedInUserID}`, updatedUser);
        }
        else {
          await client.put(`/guest/user/${guestId}`, updatedUser);
        }
      }
    } catch (error) {
      console.log("error: ", error);
    }
  },
};
