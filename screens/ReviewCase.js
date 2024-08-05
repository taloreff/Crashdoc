import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import { Feather } from "@expo/vector-icons";
import { PDFDocument } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { onboardingService } from "../services/onboarding.service";
import { createCaseService } from "../services/createCase.service";
import { Buffer } from 'buffer';
import client from "../backend/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReviewCase = ({ route, navigation }) => {
    const [userOnboardingInfo, setUserOnboardingInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const {
        userId,
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
        if (!guestPhoneNumber) fetchOnboardingInfo();
        else {
            setLoading(false);
        }
    }, []);

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

    const handleCaseSubmit = async () => {
        try {
            let data;
            if (guestPhoneNumber) {
                data = {
                    userId,
                    guestPhoneNumber,
                    guestVehicleNumber,
                    guestLicenseNumber,
                    guestVehicleModel,
                    guestDocuments,
                    thirdPartyId,
                    phoneNumber,
                    vehicleNumber,
                    licenseNumber,
                    vehicleModel,
                    documents,
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

            await createCaseService.handleCasePress(data);

            navigation.navigate("Home Page");
        } catch (error) {
            console.error("Error creating case:", error);
        }
    };


    const createPDFAndShare = async () => {
        try {
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 700]); // Increased height for more content

            // Determine whether the user is a guest
            const isGuest = !!guestPhoneNumber;

            // User Information
            page.drawText('User Information:', { x: 50, y: 650, size: 20 });

            console.log("all:", userOnboardingInfo, thirdPartyId, phoneNumber, vehicleNumber, licenseNumber, vehicleModel, documents, damagePhotos);

            if (isGuest) {
                page.drawText(`User ID: ${userId}`, { x: 50, y: 630, size: 15 });
                page.drawText(`Phone Number: ${guestPhoneNumber}`, { x: 50, y: 610, size: 15 });
                page.drawText(`Vehicle Number: ${guestVehicleNumber}`, { x: 50, y: 590, size: 15 });
                page.drawText(`License Number: ${guestLicenseNumber}`, { x: 50, y: 570, size: 15 });
                page.drawText(`Vehicle Model: ${guestVehicleModel}`, { x: 50, y: 550, size: 15 });
                page.drawText('Documents:', { x: 50, y: 530, size: 15 });

                if (guestDocuments && typeof guestDocuments === 'object') {
                    Object.entries(guestDocuments).forEach(([key, value], index) => {
                        if (value) {
                            page.drawText(`- ${key}: ${value}`, { x: 60, y: 510 - index * 20, size: 12 });
                        }
                    });
                }
            } else {
                page.drawText(`User ID: ${userOnboardingInfo.userId}`, { x: 50, y: 630, size: 15 });
                page.drawText(`Phone Number: ${userOnboardingInfo.phoneNumber}`, { x: 50, y: 610, size: 15 });
                page.drawText(`Vehicle Number: ${userOnboardingInfo.vehicleNumber}`, { x: 50, y: 590, size: 15 });
                page.drawText(`License Number: ${userOnboardingInfo.licenseNumber}`, { x: 50, y: 570, size: 15 });
                page.drawText(`Vehicle Model: ${userOnboardingInfo.vehicleModel}`, { x: 50, y: 550, size: 15 });
                page.drawText('Documents:', { x: 50, y: 530, size: 15 });

                if (userOnboardingInfo.documents && typeof userOnboardingInfo.documents === 'object') {
                    Object.entries(userOnboardingInfo.documents).forEach(([key, value], index) => {
                        console.log("key:", key, "value:", value);
                        if (value && key !== "_id") {
                            page.drawText(`- ${key}: ${value}`, { x: 60, y: 510 - index * 20, size: 12 });
                        }
                    });
                }
            }

            // Third Party Information
            const thirdPartyYStart = isGuest ? 310 : 430 - (userOnboardingInfo.documents ? Object.keys(userOnboardingInfo.documents).length : 0) * 20;
            page.drawText('Third Party Information:', { x: 50, y: thirdPartyYStart, size: 20 });
            page.drawText(`Third Party ID: ${thirdPartyId}`, { x: 50, y: thirdPartyYStart - 20, size: 15 });
            page.drawText(`Phone Number: ${phoneNumber}`, { x: 50, y: thirdPartyYStart - 40, size: 15 });
            page.drawText(`Vehicle Number: ${vehicleNumber}`, { x: 50, y: thirdPartyYStart - 60, size: 15 });
            page.drawText(`License Number: ${licenseNumber}`, { x: 50, y: thirdPartyYStart - 80, size: 15 });
            page.drawText(`Vehicle Model: ${vehicleModel}`, { x: 50, y: thirdPartyYStart - 100, size: 15 });
            page.drawText('Documents:', { x: 50, y: thirdPartyYStart - 120, size: 15 });

            if (documents && typeof documents === 'object') {
                Object.entries(documents).forEach(([key, value], index) => {
                    if (value) {
                        page.drawText(`- ${key}: ${value}`, { x: 60, y: thirdPartyYStart - 140 - index * 20, size: 12 });
                    }
                });
            }

            // Damage Photos
            const damagePhotosStart = thirdPartyYStart - 160 - (documents ? Object.keys(documents).length : 0) * 20;
            page.drawText('Damage Photos:', { x: 50, y: damagePhotosStart, size: 15 });

            if (damagePhotos && typeof damagePhotos === 'object') {
                Object.entries(damagePhotos).forEach(([key, value], index) => {
                    if (value) {
                        page.drawText(`- ${key}: ${value}`, { x: 60, y: damagePhotosStart - 20 - index * 20, size: 12 });
                    }
                });
            }

            // Save the PDF document as bytes
            const pdfBytes = await pdfDoc.save();

            // Convert the PDF bytes to a base64 string
            const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

            // Define the path for the PDF file
            const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;

            // Write the base64 string to the file
            await FileSystem.writeAsStringAsync(pdfPath, pdfBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Sharing is not available on this platform');
                return;
            }

            // Share the PDF file
            await Sharing.shareAsync(pdfPath, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share PDF',
            });
        } catch (error) {
            console.error('Error creating PDF:', error);
            Alert.alert('Error', 'Failed to create or share PDF. Please try again.');
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
                <ActivityIndicator size="large" color="#E93382" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {userOnboardingInfo ?
                renderDetails(userOnboardingInfo, "User Information") : renderDetails({ userId, phoneNumber: guestPhoneNumber, vehicleNumber: guestVehicleNumber, licenseNumber: guestLicenseNumber, vehicleModel: guestVehicleModel }, "Guest Information")}
            {renderDetails(
                {
                    userId: thirdPartyId,
                    phoneNumber: phoneNumber,
                    vehicleNumber: vehicleNumber,
                    licenseNumber: licenseNumber,
                    vehicleModel: vehicleModel,
                },
                "Third Party Information"
            )}

            {userOnboardingInfo ? renderSwiperContent(
                Object.values(userOnboardingInfo.documents),
                "User Documents"
            ) : renderSwiperContent(
                Object.values(guestDocuments),
                "Guest Documents")}
            {renderSwiperContent(
                Object.values(documents),
                "Third Party Documents"
            )}
            {renderSwiperContent(Object.values(damagePhotos), "Damage Photos")}

            {assessmentResult && (
                <View style={styles.assessmentResultContainer}>
                    <Text style={styles.assessmentResultTitle}>Assessment Result</Text>
                    {typeof assessmentResult === 'string' ? (
                        <Text>{assessmentResult}</Text>
                    ) : (
                        assessmentResult
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleCaseSubmit}>
                <Text style={styles.submitButtonText}>Submit Case</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={createPDFAndShare}>
                <Feather name="share" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share PDF</Text>
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
        marginVertical: 20,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    shareButton: {
        backgroundColor: "#007386",
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 44,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
        marginBottom: 60,
        flexDirection: "row",
    },
    shareButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
});

export default ReviewCase;
