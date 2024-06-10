import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadService } from "./upload.service.js";

export const createCaseService = {
  handleCasePress: async (data) => {
    const {
      ID_user,
      Phone_number,
      Vehicle_number,
      License_number,
      Vehicle_model,
      documents,
      damagePhotos,
    } = data;
    try {
      const token = await AsyncStorage.getItem("token");
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      const postResponse = await client.post(
        "/case",
        {
          ID_user,
          Phone_number,
          Vehicle_number,
          License_number,
          Vehicle_model,
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

// handleLocationSelect: async (
//   details,
//   setLocation,
//   isImageUploaded,
//   setImage
// ) => {
//   try {
//     setLocation(details.description);
//     const placeId = details.place_id;
//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyBtoaDHY9OmHFBh9oIBmzADt_R6wR1uC2Q`
//     );
//     const data = await response.json();
//     const { lat, lng } = data.result.geometry.location;
//     const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=600x300&zoom=15&markers=color:red%7C${lat},${lng}&key=AIzaSyBtoaDHY9OmHFBh9oIBmzADt_R6wR1uC2Q`;
//     const base64Img = `data:image/jpg;base64,${await fetch(mapUrl)
//       .then((response) => response.blob())
//       .then(
//         (blob) =>
//           new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onloadend = () => resolve(reader.result);
//             reader.onerror = reject;
//             reader.readAsDataURL(blob);
//           })
//       )}`;
//     const imgData = await uploadService.uploadImg(base64Img);
//     if (!isImageUploaded) {
//       setImage({ imgUrl: imgData.secure_url });
//     }
//   } catch (error) {
//     console.error("Error fetching location data:", error);
//   }
// },
