import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigation from "../cmps/BottomNavigation.js";
import HeaderComponent from "../cmps/HeaderComponent.js";
import RenderPost from "../cmps/RenderPost.js";
import client from "../backend/api/client.js";
import { useFocusEffect } from "@react-navigation/native";
import { ProfileContext } from "../cmps/ProfileContext";
import { debounce } from "lodash";

const HomePage = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const { profilePic, setProfilePic } = useContext(ProfileContext);
  const [likedPosts, setLikedPosts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      debouncedFetchData();
      debouncedFetchLoggedInUserProfilePic();
      debouncedLoadLikedPosts();
    }, [loggedInUserID])
  );

  useEffect(() => {
    (async () => {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      setLoggedInUserID(currentLoggedInUserID);
    })();
  }, []);

  const fetchData = async () => {
    try {
      const postsResponse = await client.get("/post");
      let posts = postsResponse.data;

      posts.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      const postsWithUserData = await Promise.all(
        posts.map(async (post) => {
          try {
            const userResponse = await client.get(`/user/${post.user}`);
            const userData = userResponse.data;
            const postDate = new Date(userData.createdAt).toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }
            );
            return {
              ...post,
              userProfilePic: userData.image,
              username: userData.username,
              postDate,
            };
          } catch (error) {
            console.log("Error fetching user data:", error);
            return {
              ...post,
              userProfilePic: null,
              username: "Unknown",
              postDate: "",
            };
          }
        })
      );
      setPosts(postsWithUserData);
    } catch (error) {
      console.log("Error fetching posts:", error);
    }
  };

  const fetchLoggedInUserProfilePic = async () => {
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      setLoggedInUserID(currentLoggedInUserID);
      const userResponse = await client.get(`/user/${currentLoggedInUserID}`);
      const { data } = userResponse;
      setProfilePic(data.image);
    } catch (error) {
      console.error("Error fetching logged in user:", error);
    }
  };

  const loadLikedPosts = async () => {
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      if (currentLoggedInUserID) {
        const likedPostsKey = `likedPosts_${currentLoggedInUserID}`;
        const likedPosts = await AsyncStorage.getItem(likedPostsKey);
        if (likedPosts) {
          setLikedPosts(JSON.parse(likedPosts));
        } else {
          setLikedPosts([]);
        }
      } else {
        setLikedPosts([]);
      }
    } catch (error) {
      console.error("Error loading liked posts:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    debouncedFetchData();
    setIsRefreshing(false);
  };

  const toggleLike = async (postId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await client.put(`/post/${postId}/like`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedPost = response.data;
      const updatedPosts = posts.map((post) =>
        post._id === updatedPost._id
          ? { ...post, likes: updatedPost.likes }
          : post
      );
      setPosts(updatedPosts);
      updateLikedPosts(updatedPost._id);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const updateLikedPosts = async (postId) => {
    let updatedLikedPosts = [];
    if (likedPosts.includes(postId)) {
      updatedLikedPosts = likedPosts.filter((id) => id !== postId);
    } else {
      updatedLikedPosts = [...likedPosts, postId];
    }
    setLikedPosts(updatedLikedPosts);
    const likedPostsKey = `likedPosts_${loggedInUserID}`;
    await AsyncStorage.setItem(
      likedPostsKey,
      JSON.stringify(updatedLikedPosts)
    );
  };

  const isPostLiked = (postId) => {
    return likedPosts.includes(postId);
  };

  const renderPost = ({ item, index }) => {
    const isLastItem = index === posts.length - 1;
    return (
      <RenderPost
        item={item}
        isLastItem={isLastItem}
        navigation={navigation}
        toggleLike={toggleLike}
        isPostLiked={isPostLiked}
      />
    );
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), []);
  const debouncedFetchLoggedInUserProfilePic = useCallback(
    debounce(fetchLoggedInUserProfilePic, 300),
    []
  );
  const debouncedLoadLikedPosts = useCallback(
    debounce(loadLikedPosts, 300),
    []
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HeaderComponent
          loggedInUserProfilePic={profilePic}
          navigation={navigation}
        />
        <FlatList
          data={posts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            if (offsetY <= 0) {
              handleRefresh();
            }
          }}
        />
        <BottomNavigation />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
});

export default HomePage;
