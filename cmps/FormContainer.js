import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Platform
} from "react-native";
import InputField from "./InputField";
import DocumentUploader from "./DocumentUploader";
import Swiper from "react-native-swiper";

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
                        <Swiper
                            style={styles.wrapper}
                            showsButtons={true}
                            loop={false}
                            height={130}
                            containerStyle={styles.swiperContainer}
                            dotStyle={styles.dotStyle}
                            activeDotStyle={styles.activeDotStyle}
                            nextButton={<Text style={styles.swiperButton}>›</Text>}
                            prevButton={<Text style={styles.swiperButton}>‹</Text>}
                            paginationStyle={styles.paginationStyle}
                            horizontal={true}
                        >
                            {documentTypes && documentTypes.map((docPair, index) => (
                                <View style={styles.slide} key={`pair-${index}`}>
                                    {docPair.map((docType) => (
                                        <DocumentUploader
                                            key={docType}
                                            docType={docType}
                                            documentUri={documents && documents[documentTypeMapping[docType]]}
                                            onUpload={onUpload}
                                            documentTypeMapping={documentTypeMapping}
                                        />
                                    ))}
                                </View>
                            ))}
                        </Swiper>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, disabled ? styles.disabledButton : null]}
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
        marginVertical: 20,
    },
    swiperContainer: {
        height: 180,
        width: "100%",
    },
    slide: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    dotStyle: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        bottom: -10,
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    activeDotStyle: {
        backgroundColor: "#e23680",
        bottom: -10,
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    swiperButton: {
        color: "#e23680",
        fontSize: 40,
        fontWeight: "bold",
    },
    paginationStyle: {
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: "#e23680",
        paddingVertical: 18,
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
