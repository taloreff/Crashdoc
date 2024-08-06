import React, { useState } from "react";
import FormContainer from "../cmps/FormContainer";
import { uploadService } from "../services/upload.service";
import {
  validateID,
  validatePhoneNumber,
  validateCarNumber,
  validateLicenseNumber,
  validateVehicleModel,
} from "../services/validation.service";
import { Text, Alert } from "react-native";

const CreateCase = ({ route, navigation }) => {
  const [thirdPartyId, setThirdPartyId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [documents, setDocuments] = useState({});
  const [uploadedFirstPhoto, setUploadedFirstPhoto] = useState(false);
  const [idError, setIdError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
  const [licenseNumberError, setLicenseNumberError] = useState("");
  const [vehicleModelError, setVehicleModelError] = useState("");

  const {
    userId,
    guestPhoneNumber,
    guestVehicleNumber,
    guestLicenseNumber,
    guestVehicleModel,
    guestDocuments,
  } = route.params.userData;

  const documentTypeMapping = {
    "DRIVER LICENSE": "driversLicense",
    "VEHICLE LICENSE": "vehicleLicense",
    INSURANCE: "insurance",
    REGISTRATION: "registration",
    "ADDITIONAL DOCUMENTS": "additionalDocuments",
  };

  const uploadAndSaveImage = async (docType, imageUri) => {
    try {
      const base64Img = await fetch(imageUri)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );

      const uploadedImage = await uploadService.uploadImg(base64Img);
      const stateKey = documentTypeMapping[docType];
      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [stateKey]: uploadedImage.secure_url,
      }));

      if (!uploadedFirstPhoto) {
        setUploadedFirstPhoto(true);
      }
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Failed to upload the image. Please try again."
      );
      console.log("Upload Error:", error);
    }
  };

  const navigateToDamageAssessment = () => {
    let valid = true;

    if (!validateID(thirdPartyId)) {
      setIdError("Please enter a valid ID");
      valid = false;
    } else {
      setIdError("");
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Please enter a valid phone number");
      valid = false;
    } else {
      setPhoneNumberError("");
    }

    if (!validateCarNumber(vehicleNumber)) {
      setVehicleNumberError("Please enter a valid vehicle number");
      valid = false;
    } else {
      setVehicleNumberError("");
    }

    if (!validateLicenseNumber(licenseNumber)) {
      setLicenseNumberError("Please enter a valid license number");
      valid = false;
    } else {
      setLicenseNumberError("");
    }

    if (!validateVehicleModel(vehicleModel)) {
      setVehicleModelError("Please enter a valid vehicle model");
      valid = false;
    } else {
      setVehicleModelError("");
    }

    if (!valid) return;

    const commonData = {
      thirdPartyId,
      phoneNumber,
      vehicleNumber,
      licenseNumber,
      vehicleModel,
      documents,
    };

    if (!route.params.userData) {
      navigation.navigate("Damage assessment", { ...commonData });
    } else {
      navigation.navigate("Damage assessment", {
        ...commonData,
        userId,
        guestPhoneNumber,
        guestVehicleNumber,
        guestLicenseNumber,
        guestVehicleModel,
        guestDocuments,
      });
    }
  };

  const inputFields = [
    {
      label: "ID",
      value: thirdPartyId,
      onChangeText: setThirdPartyId,
      error: idError,
      keyboardType: "numeric",
    },
    {
      label: "Phone number",
      value: phoneNumber,
      onChangeText: setPhoneNumber,
      error: phoneNumberError,
      keyboardType: "numeric",
    },
    {
      label: "Vehicle number",
      value: vehicleNumber,
      onChangeText: setVehicleNumber,
      error: vehicleNumberError,
      keyboardType: "numeric",
    },
    {
      label: "License number",
      value: licenseNumber,
      onChangeText: setLicenseNumber,
      error: licenseNumberError,
      keyboardType: "numeric",
    },
    {
      label: "Vehicle model",
      value: vehicleModel,
      onChangeText: setVehicleModel,
      error: vehicleModelError,
    },
  ];

  const documentTypes = [
    ["DRIVER LICENSE", "VEHICLE LICENSE"],
    ["INSURANCE", "REGISTRATION"],
    ["ADDITIONAL DOCUMENTS"],
  ];

  return (
    <FormContainer
      headerText={
        <Text style={styles.headerText}>
          <Text style={{ color: "#e23680" }}>Third party</Text> details
        </Text>
      }
      submitButtonText="UPLOAD THIRD PARTY VEHICLE"
      onSubmit={navigateToDamageAssessment}
      inputFields={inputFields}
      documentTypes={documentTypes}
      documents={documents}
      onUpload={uploadAndSaveImage}
      documentTypeMapping={documentTypeMapping}  // Add this line
      disabled={
        !thirdPartyId ||
        !phoneNumber ||
        !vehicleNumber ||
        !licenseNumber ||
        !vehicleModel
      }
    />
  );
};

const styles = {
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
};

export default CreateCase;
