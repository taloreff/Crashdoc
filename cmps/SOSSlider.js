import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions
} from "react-native";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width * 0.9; // Width of the slider tube
const SLIDER_HEIGHT = 60; // Height of the slider tube

const SOSSlider = ({ onSlide }) => {
    const [pan] = useState(new Animated.ValueXY());

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dx > SLIDER_WIDTH - 80) {
                onSlide();
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            } else {
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const translateX = pan.x.interpolate({
        inputRange: [0, SLIDER_WIDTH - 80],
        outputRange: [0, SLIDER_WIDTH - 80],
        extrapolate: "clamp",
    });

    return (
        <View style={styles.container}>
            <View style={styles.sliderTube}>
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.slider, { transform: [{ translateX }] }]}
                >
                    <Text style={styles.sliderText}>SOS</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
    },
    sliderTube: {
        minWidth: SLIDER_WIDTH,
        height: SLIDER_HEIGHT,
        borderRadius: SLIDER_HEIGHT / 2,
        // backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ff69b4",
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 4,
    },
    slider: {
        width: SLIDER_HEIGHT - 8,
        height: SLIDER_HEIGHT - 8,
        borderRadius: SLIDER_HEIGHT / 2,
        backgroundColor: "#ff69b4",
        justifyContent: "center",
        alignItems: "center",
    },
    sliderText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default SOSSlider;
