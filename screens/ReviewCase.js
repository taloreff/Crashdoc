// ReviewCase.js
import React, { useEffect, useState } from "react";
import client from "../backend/api/client";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import { onboardingService } from "../services/onboarding.service";
import { createCaseService } from "../services/createCase.service";

const ReviewCase = ({ route, navigation }) => {
    const [userOnboardingInfo, setUserOnboardingInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const {
        thirdPartyId,
        phoneNumber,
        vehicleNumber,
        licenseNumber,
        vehicleModel,
        documents,
        guestPhoneNumber,
        guestVehicleNumber,
        guestLicenseNumber,
        guestVehicleModel,
        guestDocuments,
        damagePhotos,
        assessmentResult,
    } = route.params;

    useEffect(() => {
        const fetchOnboardingInfo = async () => {
            try {
                const onboardingInfo = await onboardingService.getOnboardingInfo();
                setUserOnboardingInfo(onboardingInfo);
            } catch (error) {
                console.error("Error fetching onboarding info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOnboardingInfo();
    }, []);

    const handleCaseSubmit = async () => {
        try {
            let data;
            if (guestPhoneNumber) {
                data = {
                    thirdPartyId,
                    phoneNumber: guestPhoneNumber,
                    vehicleNumber: guestVehicleNumber,
                    licenseNumber: guestLicenseNumber,
                    vehicleModel: guestVehicleModel,
                    documents: guestDocuments,
                    damagePhotos,
                };
            } else {
                data = {
                    userInfo: userOnboardingInfo,
                    thirdPartyId,
                    phoneNumber,
                    vehicleNumber,
                    licenseNumber,
                    vehicleModel,
                    documents,
                    damagePhotos,
                };
            }
            createCaseService.handleCasePress(data);
            navigation.navigate("Home Page");
        } catch (error) {
            console.error("Error creating case:", error);
        }
    };

    const renderDetails = (details, title) => (
        <>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>{details.userId}</Text>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{details.phoneNumber}</Text>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Vehicle Number</Text>
                <Text style={styles.value}>{details.vehicleNumber}</Text>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>License Number</Text>
                <Text style={styles.value}>{details.licenseNumber}</Text>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Vehicle Model</Text>
                <Text style={styles.value}>{details.vehicleModel}</Text>
            </View>
        </>
    );

    const renderSwiperContent = (items, title) => (
        <View style={styles.swiperContainer}>
            <Text style={styles.swiperTitle}>{title}</Text>
            <Swiper
                style={styles.wrapper}
                showsButtons={true}
                loop={false}
                containerStyle={styles.swiperInnerContainer}
                dotStyle={styles.dotStyle}
                activeDotStyle={styles.activeDotStyle}
                nextButton={<Text style={styles.swiperButton}>›</Text>}
                prevButton={<Text style={styles.swiperButton}>‹</Text>}
                paginationStyle={styles.paginationStyle}
            >
                {items.map((item, index) => (
                    <View style={styles.slide} key={index}>
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>
                ))}
            </Swiper>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {userOnboardingInfo && renderDetails(userOnboardingInfo, "User Information")}
            {renderDetails(
                {
                    userId: thirdPartyId,
                    phoneNumber: guestPhoneNumber || phoneNumber,
                    vehicleNumber: guestVehicleNumber || vehicleNumber,
                    licenseNumber: guestLicenseNumber || licenseNumber,
                    vehicleModel: guestVehicleModel || vehicleModel,
                },
                "Third Party Information"
            )}

            {renderSwiperContent(
                Object.values(userOnboardingInfo.documents),
                "Documents"
            )}
            {renderSwiperContent(
                Object.values(damagePhotos),
                "Damage Photos"
            )}

            {assessmentResult && (
                <View style={styles.assessmentResultContainer}>
                    <Text style={styles.assessmentResultTitle}>Assessment Result</Text>
                    {assessmentResult}
                </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleCaseSubmit}>
                <Text style={styles.submitButtonText}>Submit Case</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    fieldContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
    },
    value: {
        fontSize: 16,
        color: "#333",
    },
    swiperContainer: {
        marginVertical: 20,
    },
    swiperTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    swiperInnerContainer: {
        height: 250,
    },
    wrapper: {},
    slide: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    image: {
        width: "100%",
        height: 230,
        borderRadius: 8,
    },
    dotStyle: {
        backgroundColor: "rgba(0,0,0,.2)",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    activeDotStyle: {
        backgroundColor: "#E93382",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    swiperButton: {
        color: "#E93382",
        fontSize: 40,
        fontWeight: "bold",
    },
    paginationStyle: {
        bottom: 10,
    },
    assessmentResultContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.2)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
        justifyContent: "center",
    },
    assessmentResultTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: "#E93382",
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 44,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 40,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ReviewCase;
