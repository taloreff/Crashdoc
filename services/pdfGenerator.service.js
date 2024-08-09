import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import * as ImageManipulator from "expo-image-manipulator";

const imageCache = new Map();

const fetchImageAsArrayBuffer = async (imageUrl) => {
  try {
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl);
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    imageCache.set(imageUrl, arrayBuffer);
    return arrayBuffer;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

const convertAndResizeImage = async (imageUri) => {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 300 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
};

export const createAndSharePDF = async (caseItem) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 1000]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Fetch and embed the logo
    const logoUrl =
      "https://res.cloudinary.com/dd7nwvjli/image/upload/v1722956071/glnuan24jxpdjzpclak1.jpg";
    const logoImageBytes = await fetchImageAsArrayBuffer(logoUrl);
    const logoImage = await pdfDoc.embedJpg(logoImageBytes);

    // Draw the logo
    page.drawImage(logoImage, {
      x: page.getWidth() - 220,
      y: page.getHeight() - 120,
      width: 200,
      height: 100,
    });

    const drawText = (text, x, y, size, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: font,
        color: isBold ? rgb(0, 0, 0) : rgb(0.3, 0.3, 0.3),
      });
    };

    // Optimized drawImage function
    const drawImage = async (imageUrl, x, y, width, height) => {
      if (!imageUrl) {
        console.log("Attempted to load an image with an empty URL");
        return;
      }
      try {
        const convertedImageUrl = await convertAndResizeImage(imageUrl);
        const imageBytes = await fetchImageAsArrayBuffer(convertedImageUrl);
        const image = await pdfDoc.embedJpg(imageBytes);
        page.drawImage(image, { x, y, width, height, quality: 0.8 });
      } catch (error) {
        console.error(`Failed to load image from URL: ${imageUrl}`, error);
      }
    };

    // Layout setup
    let yPos = 950;
    const initialXPos = 50;
    const imageWidth = 100;
    const imageHeight = 100;
    const xSpacing = 120;
    const ySpacing = 120;

    // Title
    drawText("My Case", 50, yPos, 24, true);
    yPos -= 40;

    // Determine if it's a guest or user
    const isGuest = !!caseItem.guestPhoneNumber;

    // User/Guest Information
    const title = isGuest ? "Guest Information:" : "User Information:";
    drawText(title, 50, yPos, 16, true);
    yPos -= 20;

    const userInfo = isGuest
      ? [
          { label: "User ID", value: caseItem.userId },
          { label: "Phone Number", value: caseItem.guestPhoneNumber },
          { label: "Vehicle Number", value: caseItem.guestVehicleNumber },
          { label: "License Number", value: caseItem.guestLicenseNumber },
          { label: "Vehicle Model", value: caseItem.guestVehicleModel },
        ]
      : [
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

    // User/Guest Documents
    drawText("Documents:", 50, yPos, 16, true);
    yPos -= 20;
    const documents = isGuest
      ? caseItem.guestDocuments
      : caseItem.userInfo.documents;
    if (documents) {
      const documentPromises = Object.entries(documents)
        .filter(([key, docUrl]) => key !== "_id" && docUrl)
        .map(([key, docUrl], index) =>
          drawImage(
            docUrl,
            initialXPos + (index % 4) * xSpacing,
            yPos - Math.floor(index / 4) * ySpacing - imageHeight,
            imageWidth,
            imageHeight
          )
        );
      await Promise.all(documentPromises);
      yPos -= Math.ceil(documentPromises.length / 4) * ySpacing;
    }

    // Third Party Information
    yPos -= 60;
    drawText("Third Party Information:", 50, yPos, 16, true);
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
    drawText("Documents:", 50, yPos, 16, true);
    yPos -= 20;
    const thirdPartyDocuments = Array.isArray(caseItem.documents)
      ? caseItem.documents[0]
      : caseItem.documents;
    const thirdPartyDocumentPromises = Object.entries(thirdPartyDocuments)
      .filter(([key, docUrl]) => key !== "_id" && docUrl)
      .map(([key, docUrl], index) =>
        drawImage(
          docUrl,
          initialXPos + (index % 4) * xSpacing,
          yPos - Math.floor(index / 4) * ySpacing - imageHeight,
          imageWidth,
          imageHeight
        )
      );
    await Promise.all(thirdPartyDocumentPromises);
    yPos -= Math.ceil(thirdPartyDocumentPromises.length / 4) * ySpacing;

    // Damage Photos
    drawText("Damage Photos:", 50, yPos, 16, true);
    yPos -= 20;
    const damagePhotos = Array.isArray(caseItem.damagePhotos)
      ? caseItem.damagePhotos[0]
      : caseItem.damagePhotos;
    const photoPromises = Object.entries(damagePhotos)
      .filter(([key, photoUrl]) => key !== "_id" && photoUrl)
      .map(([key, photoUrl], index) =>
        drawImage(
          photoUrl,
          initialXPos + (index % 4) * xSpacing,
          yPos - Math.floor(index / 4) * ySpacing - imageHeight,
          imageWidth,
          imageHeight
        )
      );
    await Promise.all(photoPromises);

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const pdfPath = `${FileSystem.documentDirectory}case-info.pdf`;
    await FileSystem.writeAsStringAsync(
      pdfPath,
      Buffer.from(pdfBytes).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
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
