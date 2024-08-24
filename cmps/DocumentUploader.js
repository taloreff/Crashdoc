import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadService } from "../services/upload.service";

const DocumentUploader = ({
  docType,
  documentUri,
  onUpload,
  documentTypeMapping,
}) => {
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(documentUri);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return (
      cameraStatus.status === "granted" &&
      mediaLibraryStatus.status === "granted"
    );
  };

  const handleDocumentUpload = async () => {
    const hasPermissions = await requestPermissions();

    if (!hasPermissions) {
      Alert.alert(
        "Permission required",
        "Please allow camera and media library permissions in your settings."
      );
      return;
    }

    Alert.alert(
      "Upload Document",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.6, // Reduced quality to speed up upload
            });

            if (!result.canceled) {
              const imageUri = result.assets[0].uri;
              setLocalImageUri(imageUri); // Display image immediately
              uploadImage(docType, imageUri); // Upload in the background
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.6, // Reduced quality to speed up upload
            });

            if (!result.canceled) {
              const imageUri = result.assets[0].uri;
              setLocalImageUri(imageUri); // Display image immediately
              uploadImage(docType, imageUri); // Upload in the background
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const uploadImage = async (docType, imageUri) => {
    setUploading(true);
    try {
      const base64Img = await convertUriToBase64(imageUri);
      const uploadedImage = await uploadService.uploadImg(base64Img);
      console.log("Uploaded Image:", uploadedImage.secure_url);
      onUpload(docType, uploadedImage.secure_url); // Update the document URL after upload
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Failed to upload the image. Please try again."
      );
      console.log("Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  const convertUriToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <TouchableOpacity
      style={styles.documentButton}
      onPress={handleDocumentUpload}
      disabled={uploading}
    >
      {uploading && (
        <ActivityIndicator
          style={styles.uploadIndicator}
          size="small"
          color="#e23680"
        />
      )}
      {localImageUri ? (
        <Image
          source={{ uri: localImageUri }}
          style={styles.documentImage}
          resizeMode="cover"
        />
      ) : (
        <>
          <View style={styles.uploadIconContainer}>
            <Feather name="upload" size={18} style={styles.uploadIcon} />
          </View>
          <Text style={styles.documentButtonText}>{docType}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  documentButton: {
    width: 95,
    height: 95,
    borderRadius: 55,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    position: "relative",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  uploadIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 17.5,
    backgroundColor: "#e23680",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 2,
    right: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  uploadIcon: {
    color: "#fff",
  },
  documentImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  documentButtonText: {
    color: "rgba(0, 0, 0, 0.6)",
    fontSize: 9.5,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  uploadIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
});

export default DocumentUploader;
