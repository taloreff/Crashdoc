import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createCaseService } from "../services/createCase.service";

const CreateCase = ({ navigation }) => {
  const [ID_uesr, setID_uesr] = useState("");
  const [Phone_number, setPhone_number] = useState("");
  const [Vehicle_number, setVehicle_number] = useState("");
  const [License_number, setLicense_number] = useState("");
  const [Vehicle_model, setVehicle_model] = useState("");
  const [documents, setDocuments] = useState([]);

  const handleCaseSubmit = async () => {
    try {
      await createCaseService.handleCaseSubmit(
        ID_uesr,
        Phone_number,
        Vehicle_number,
        License_number,
        Vehicle_model,
        documents,
        navigation
      );
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setDocuments([...documents, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Third party details</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="ID"
          value={ID_uesr}
          onChangeText={setID_uesr}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={Phone_number}
          onChangeText={setPhone_number}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle number"
          value={Vehicle_number}
          onChangeText={setVehicle_number}
        />
        <TextInput
          style={styles.input}
          placeholder="License number"
          value={License_number}
          onChangeText={setLicense_number}
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle model"
          value={Vehicle_model}
          onChangeText={setVehicle_model}
        />

        <View style={styles.documentContainer}>
          <TouchableOpacity
            style={styles.documentButton}
            onPress={handleDocumentUpload}
          >
            <Feather name="upload" size={24} color="#e23680" />
            <Text style={styles.documentButtonText}>THE DRIVER'S LICENCE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.documentButton}
            onPress={handleDocumentUpload}
          >
            <Feather name="upload" size={24} color="#e23680" />
            <Text style={styles.documentButtonText}>
              THE DRIVER'S VEHICLE LICENSE
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCaseSubmit}
        >
          <Text style={styles.submitButtonText}>NEXT TO MY DETAILS</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: "#F3F3F6FF",
    padding: 8,
    marginVertical: 8,
  },
  documentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F6FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    width: "48%",
  },
  documentButtonText: {
    color: "#e23680",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateCase;
