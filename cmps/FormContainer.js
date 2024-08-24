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
              {documentTypes.flat().map((docType, index) => (
                <View style={styles.gridItem} key={index}>
                  <DocumentUploader
                    docType={docType}
                    documentUri={
                      documents && documents[documentTypeMapping[docType]]
                    }
                    onUpload={onUpload}
                    documentTypeMapping={documentTypeMapping}
                  />
                </View>
              ))}
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
    marginVertical: 0,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
    marginVertical: 8,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#e23680",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: "#e23680",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default FormContainer;
