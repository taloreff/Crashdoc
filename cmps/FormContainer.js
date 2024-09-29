import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Platform,
  Image,
} from "react-native";
import InputField from "./InputField";
import DocumentUploader from "./DocumentUploader";

const FormContainer = ({
  headerText,
  submitButtonText,
  onSubmit,
  inputFields,
  documentTypes,
  documentTypeMapping,
  documents,
  onUpload,
  disabled,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{headerText}</Text>
          </View>

          {inputFields.map((field) => (
            <InputField
              key={field.label}
              label={field.label}
              value={field.value}
              onChangeText={field.onChangeText}
              error={field.error}
              keyboardType={field.keyboardType}
            />
          ))}

          <View style={styles.documentContainer}>
            <View style={styles.gridContainer}>
              {/* First row with 3 frames */}
              <View style={styles.gridItem}>
                <DocumentUploader
                  docType={documentTypes[0][0]}
                  documentUri={
                    documents &&
                    documents[documentTypeMapping[documentTypes[0][0]]]
                  }
                  onUpload={onUpload}
                  documentTypeMapping={documentTypeMapping}
                />
              </View>
              <View style={styles.gridItem}>
                <DocumentUploader
                  docType={documentTypes[0][1]}
                  documentUri={
                    documents &&
                    documents[documentTypeMapping[documentTypes[0][1]]]
                  }
                  onUpload={onUpload}
                  documentTypeMapping={documentTypeMapping}
                />
              </View>
              <View style={styles.gridItem}>
                <DocumentUploader
                  docType={documentTypes[0][2]} // Changed to [0][2] for third item in first row
                  documentUri={
                    documents &&
                    documents[documentTypeMapping[documentTypes[0][2]]]
                  }
                  onUpload={onUpload}
                  documentTypeMapping={documentTypeMapping}
                />
              </View>

              {/* Second row with 3 frames, middle one is the logo */}
              <View style={styles.gridItem}>
                <DocumentUploader
                  docType={documentTypes[1][0]}
                  documentUri={
                    documents &&
                    documents[documentTypeMapping[documentTypes[1][0]]]
                  }
                  onUpload={onUpload}
                  documentTypeMapping={documentTypeMapping}
                />
              </View>
              <View style={styles.gridItemLogo}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../assets/logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.gridItem}>
                <DocumentUploader
                  docType={documentTypes[1][2]} // Changed to [1][2] for third item in second row
                  documentUri={
                    documents &&
                    documents[documentTypeMapping[documentTypes[1][2]]]
                  }
                  onUpload={onUpload}
                  documentTypeMapping={documentTypeMapping}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              disabled ? styles.disabledButton : null,
            ]}
            onPress={onSubmit}
            disabled={disabled}
          >
            <Text style={styles.submitButtonText}>{submitButtonText}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  documentContainer: {
    marginVertical: 14,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "29%",
    marginVertical: 6,
    alignItems: "center",
  },
  gridItemLogo: {
    width: "29%",
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: "#F3F3F6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#e23680",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FormContainer;
