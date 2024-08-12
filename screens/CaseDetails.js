import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import client from "../backend/api/client";

const { width } = Dimensions.get("window");

const CaseDetails = ({ route }) => {
  const { caseId } = route.params;
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("myDetails");

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await client.get(`/case/${caseId}`);
        setCaseDetails(response.data);
        console.log("Case details:", response.data);
      } catch (error) {
        console.error("Error fetching case details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, []);

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
        {items
          .filter((item) => item && item.trim() !== "")
          .map((item, index) => (
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

  const renderDetails = (details) => (
    <>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>User ID</Text>
        <TextInput
          style={styles.input}
          value={details.userId}
          editable={false}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={details.phoneNumber}
          editable={false}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          value={details.vehicleNumber}
          editable={false}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>License Number</Text>
        <TextInput
          style={styles.input}
          value={details.licenseNumber}
          editable={false}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vehicle Model</Text>
        <TextInput
          style={styles.input}
          value={details.vehicleModel}
          editable={false}
        />
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#E93382" />
      </SafeAreaView>
    );
  }

  const myDetails = caseDetails.userInfo;
  const thirdPartyDetails = {
    userId: caseDetails.thirdPartyId,
    phoneNumber: caseDetails.phoneNumber,
    vehicleNumber: caseDetails.vehicleNumber,
    licenseNumber: caseDetails.licenseNumber,
    vehicleModel: caseDetails.vehicleModel,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "myDetails" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("myDetails")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "myDetails" && styles.activeTabButtonText,
            ]}
          >
            My details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "thirdPartyDetails" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("thirdPartyDetails")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "thirdPartyDetails" && styles.activeTabButtonText,
            ]}
          >
            Third party details
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "myDetails"
          ? renderDetails(myDetails)
          : renderDetails(thirdPartyDetails)}
        {console.log(
          "Case details user info documents:",
          caseDetails.userInfo.documents
        )}
        {activeTab === "myDetails"
          ? caseDetails.userInfo.documents &&
            renderSwiperContent(
              Object.values(caseDetails.userInfo.documents).filter(Boolean),
              "My Documents"
            )
          : caseDetails.documents &&
            caseDetails.documents.length > 0 &&
            renderSwiperContent(
              caseDetails.documents.flatMap((doc) => Object.values(doc)),
              "Third Party Documents"
            )}
        {caseDetails.damagePhotos &&
          caseDetails.damagePhotos.length > 0 &&
          renderSwiperContent(
            caseDetails.damagePhotos.flatMap((photo) => Object.values(photo)),
            "Damage Photos"
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  swiperContainer: {
    marginBottom: 20,
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
    width: width - 40,
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
  },
  activeTabButton: {
    borderBottomColor: "#E93382",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  activeTabButtonText: {
    color: "#E93382",
  },
});

export default CaseDetails;
