import { View, Text, TextInput, StyleSheet } from "react-native";

const InputField = ({ label, value, onChangeText, error, keyboardType }) => {
    return (
        <View style={styles.container}>
            <Text>{label}</Text>
            <TextInput
                style={[styles.input, error ? styles.errorInput : null]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.2)",
        padding: 12,
        marginTop: 6,
    },
    errorInput: {
        borderColor: "#e23680",
    },
    errorText: {
        color: "#e23680",
        fontSize: 12,
        marginTop: 4,
    },
});

export default InputField;
