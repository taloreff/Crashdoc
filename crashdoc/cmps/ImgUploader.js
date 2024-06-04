import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadService } from "../services/upload.service";

export function ImgUploader({ onUploaded = null }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const selectImage = async (launchFunction) => {
    setIsUploading(true);
    try {
      const response = await launchFunction({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });
      if (response.canceled) {
        setIsUploading(false);
        return;
      }
      const { uri } = response.assets[0];
      setSelectedImage({ localUri: uri });

      let base64Img = `data:image/jpg;base64,${response.assets[0].base64}`;
      const imgData = await uploadService.uploadImg(base64Img);

      setIsUploading(false);
      if (imgData && imgData.secure_url) {
        onUploaded && onUploaded({ imgUrl: imgData.secure_url });
      } else {
        console.error("imgData does not contain secure_url", imgData);
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Failed to upload image", error);
    }
  };

  const uploadImg = () => selectImage(ImagePicker.launchImageLibraryAsync);
  const takePhoto = () => selectImage(ImagePicker.launchCameraAsync);

  return (
    <View style={styles.container}>
      {isUploading && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color="#F7706EFF" />
        </View>
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={uploadImg}
        >
          <Text style={styles.buttonText}>Upload a photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.photoButton]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>Take a photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#F7706EFF",
    marginRight: 10,
    flex: 1,
  },
  photoButton: {
    backgroundColor: "#F7706EFF",
    marginLeft: 10,
    flex: 1,
  },
  activityIndicatorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
