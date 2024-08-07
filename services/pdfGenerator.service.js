// pdfService.js

import { PDFDocument, StandardFonts } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";

const fetchImageAsArrayBuffer = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error; // Re-throw to handle it in the calling function
    }
};

export const createAndSharePDF = async (caseItem) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 1000]); // Increase height as needed
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Fetch and embed the logo
        const logoUrl =
            "https://res.cloudinary.com/dd7nwvjli/image/upload/v1722956071/glnuan24jxpdjzpclak1.jpg";
        const logoImageBytes = await fetchImageAsArrayBuffer(logoUrl);
        const logoImage = await pdfDoc.embedJpg(logoImageBytes);

        // Draw the logo in the top right corner
        page.drawImage(logoImage, {
            x: page.getWidth() - 220, // Adjust according to your layout needs
            y: page.getHeight() - 120, // Adjust according to your layout needs
            width: 200,
            height: 100,
        });

        const drawBoldText = (text, x, y, size) => {
            page.drawText(text, { x, y, size, font: helveticaBold });
        };

        const drawText = (text, x, y, size) => {
            page.drawText(text, { x, y, size, font: helvetica });
        };

        // Draw Image
        const drawImage = async (imageUrl, x, y, width, height) => {
            if (!imageUrl) {
                console.log("Attempted to load an image with an empty URL");
                return;
            }
            try {
                const imageBytes = await fetchImageAsArrayBuffer(imageUrl);

                // Check if the image is JPEG or PNG
                let image;
                if (imageUrl.endsWith(".png")) {
                    image = await pdfDoc.embedPng(imageBytes);
                } else if (imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")) {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else {
                    console.warn(`Unsupported image format for URL: ${imageUrl}`);
                    return;
                }

                page.drawImage(image, { x, y, width, height });
            } catch (error) {
                console.error(`Failed to load image from URL: ${imageUrl}`, error);
            }
        };

        // Layout setup
        let yPos = 950; // Initial y position for the page
        const initialXPos = 50; // Starting x position for the first image
        const imageWidth = 100;
        const imageHeight = 100;
        const xSpacing = 120; // Space between images horizontally
        const ySpacing = 120; // Space between rows of images

        // Title
        drawBoldText("My Case", 50, yPos, 24);
        yPos -= 40;

        // User Information
        drawBoldText("User Information:", 50, yPos, 16);
        yPos -= 20;
        const userInfo = [
            { label: "User ID", value: caseItem.userInfo.userId },
            { label: "Phone Number", value: caseItem.userInfo.phoneNumber },
            { label: "Vehicle Number", value: caseItem.userInfo.vehicleNumber },
            { label: "License Number", value: caseItem.userInfo.licenseNumber },
            { label: "Vehicle Model", value: caseItem.userInfo.vehicleModel },
        ];

        userInfo.forEach((info) => {
            drawText(`${info.label}: ${info.value || "N/A"}`, 60, yPos, 12);
            yPos -= 15;
        });
        yPos -= 10;

        // User Documents
        drawBoldText("Documents:", 50, yPos, 16);
        yPos -= 20;
        if (caseItem.userInfo && caseItem.userInfo.documents) {
            let xPos = initialXPos;
            let imageCount = 0;
            for (const [key, docUrl] of Object.entries(
                caseItem.userInfo.documents
            )) {
                if (key === "_id" || !docUrl) continue;
                await drawImage(
                    docUrl,
                    xPos,
                    yPos - imageHeight,
                    imageWidth,
                    imageHeight
                );
                xPos += xSpacing;
                imageCount++;
                if (imageCount % 4 === 0) {
                    // Move to the next row after 4 images
                    xPos = initialXPos;
                    yPos -= ySpacing;
                }
            }
            if (imageCount % 4 !== 0) {
                yPos -= ySpacing; // Move to the next section if there are remaining images
            }
        }

        // Third Party Information
        yPos -= 60;
        drawBoldText("Third Party Information:", 50, yPos, 16);
        yPos -= 20;
        const thirdPartyInfo = [
            { label: "Third Party ID", value: caseItem.thirdPartyId },
            { label: "Phone Number", value: caseItem.phoneNumber },
            { label: "Vehicle Number", value: caseItem.vehicleNumber },
            { label: "License Number", value: caseItem.licenseNumber },
            { label: "Vehicle Model", value: caseItem.vehicleModel },
        ];

        thirdPartyInfo.forEach((info) => {
            drawText(`${info.label}: ${info.value || "N/A"}`, 60, yPos, 12);
            yPos -= 15;
        });
        yPos -= 10;

        // Third Party Documents
        drawBoldText("Documents:", 50, yPos, 16);
        yPos -= 20;
        if (Array.isArray(caseItem.documents)) {
            let xPos = initialXPos;
            let imageCount = 0;
            for (const [key, docUrl] of Object.entries(caseItem.documents[0])) {
                if (key === "_id" || !docUrl) continue;
                await drawImage(
                    docUrl,
                    xPos,
                    yPos - imageHeight,
                    imageWidth,
                    imageHeight
                );
                xPos += xSpacing;
                imageCount++;
                if (imageCount % 4 === 0) {
                    xPos = initialXPos;
                    yPos -= ySpacing;
                }
            }
            if (imageCount % 4 !== 0) {
                yPos -= ySpacing;
            }
        } else {
            let xPos = initialXPos;
            let imageCount = 0;
            for (const [key, docUrl] of Object.entries(caseItem.documents)) {
                if (key === "_id" || !docUrl) continue;
                await drawImage(
                    docUrl,
                    xPos,
                    yPos - imageHeight,
                    imageWidth,
                    imageHeight
                );
                xPos += xSpacing;
                imageCount++;
                if (imageCount % 4 === 0) {
                    xPos = initialXPos;
                    yPos -= ySpacing;
                }
            }
            if (imageCount % 4 !== 0) {
                yPos -= ySpacing;
            }
        }

        // Damage Photos
        drawBoldText("Damage Photos:", 50, yPos, 16);
        yPos -= 20;
        if (Array.isArray(caseItem.damagePhotos)) {
            let xPos = initialXPos;
            let imageCount = 0;
            for (const [key, photoUrl] of Object.entries(caseItem.damagePhotos[0])) {
                if (key === "_id" || !photoUrl) continue;
                await drawImage(
                    photoUrl,
                    xPos,
                    yPos - imageHeight,
                    imageWidth,
                    imageHeight
                );
                xPos += xSpacing;
                imageCount++;
                if (imageCount % 4 === 0) {
                    xPos = initialXPos;
                    yPos -= ySpacing;
                }
            }
            if (imageCount % 4 !== 0) {
                yPos -= ySpacing;
            }
        } else {
            let xPos = initialXPos;
            let imageCount = 0;
            for (const [key, photoUrl] of Object.entries(caseItem.damagePhotos)) {
                if (key === "_id" || !photoUrl) continue;
                await drawImage(
                    photoUrl,
                    xPos,
                    yPos - imageHeight,
                    imageWidth,
                    imageHeight
                );
                xPos += xSpacing;
                imageCount++;
                if (imageCount % 4 === 0) {
                    xPos = initialXPos;
                    yPos -= ySpacing;
                }
            }
            if (imageCount % 4 !== 0) {
                yPos -= ySpacing;
            }
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;
        await FileSystem.writeAsStringAsync(
            pdfPath,
            Buffer.from(pdfBytes).toString("base64"),
            {
                encoding: FileSystem.EncodingType.Base64,
            }
        );

        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on this platform");
            return;
        }

        await Sharing.shareAsync(pdfPath, {
            mimeType: "application/pdf",
            dialogTitle: "Share PDF",
        });
    } catch (error) {
        console.error("Error creating PDF:", error);
        Alert.alert("Error", "Failed to create or share PDF. Please try again.");
    }
};
