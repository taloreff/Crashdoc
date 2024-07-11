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
      console.log("guestId", guestId);
      let userData;
      if (currentLoggedInUserID) {
        const { data } = await client.get("/user/" + currentLoggedInUserID, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        userData = data
      } else {
        console.log("1111111")
        const { data } = await client.get("/guest/user/" + guestId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        userData = data
      }


      console.log("userData", userData);

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

      console.log("post response", postResponse.data);
      let response
      if (currentLoggedInUserID) {
        response = await client.get("/user/" + currentLoggedInUserID);
      }
      else {
        response = await client.get("/guest/user/" + guestId);
      }
      console.log("USER response", response.data);
      const existingUser = response.data;
      if (existingUser) {
        const updatedUser = {
          ...existingUser,
          cases: [...existingUser.cases, postResponse.data],
        };
        console.log("updatedUser ", updatedUser);
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
