import React, { useState } from "react";
import FormContainer from "../cmps/FormContainer";
import {
  validateID,
  validatePhoneNumber,
  validateCarNumber,
  validateLicenseNumber,
  validateVehicleModel,
} from "../services/validation.service";
import { Text } from "react-native";

const GuestScreen = ({ navigation }) => {
  const [userId, setUserId] = useState("");
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

  const documentTypeMapping = {
    "DRIVER LICENSE": "driversLicense",
    "VEHICLE LICENSE": "vehicleLicense",
    INSURANCE: "insurance",
    REGISTRATION: "registration",
    "ADDITIONAL DOCUMENTS": "additionalDocuments",
  };

  const handleDocumentUpload = (docType, secureUrl) => {
    const stateKey = documentTypeMapping[docType];
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [stateKey]: secureUrl,
    }));

    if (!uploadedFirstPhoto) {
      setUploadedFirstPhoto(true);
    }
  };

  const handleGuestSubmit = () => {
    let valid = true;

    if (!validateID(userId)) {
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

    const data = {
      userId,
      guestPhoneNumber: phoneNumber,
      guestVehicleNumber: vehicleNumber,
      guestLicenseNumber: licenseNumber,
      guestVehicleModel: vehicleModel,
      guestDocuments: documents,
    };
    console.log("we send data to create case", data);
    navigation.navigate("Create Case", { userData: data });
  };

  const inputFields = [
    {
      label: "ID",
      value: userId,
      onChangeText: setUserId,
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
    ["DRIVER LICENSE", "VEHICLE LICENSE", "INSURANCE"],
    ["REGISTRATION", "CRASHDOC", "ADDITIONAL DOCUMENTS"],
  ];

  return (
    <FormContainer
      headerText={
        <Text style={styles.headerText}>
          <Text style={{ color: "#e23680" }}>Enter your</Text> information
        </Text>
      }
      submitButtonText="UPLOAD YOUR INFO"
      onSubmit={handleGuestSubmit}
      inputFields={inputFields}
      documentTypes={documentTypes}
      documents={documents}
      onUpload={handleDocumentUpload}
      documentTypeMapping={documentTypeMapping}
      disabled={
        !userId ||
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

export default GuestScreen;
