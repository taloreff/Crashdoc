import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function ImagePreview({ image }) {
  return (
    <View style={styles.imageContainer}>
      {image ? (
        <Image source={{ uri: image.imgUrl }} style={styles.image} />
      ) : (
        <View>
          <Image
            source={require("../assets/post_img2.jpg")}
            style={styles.image}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignContent: "center",
  },
  image: {
    width: "70%",
    height: 250,
    borderRadius: 80,
    resizeMode: "contain",
    marginVertical: 16,
    alignSelf: "center",
  },
});
