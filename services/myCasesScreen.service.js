import client from "../backend/api/client.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const myFormsScreen = {
  fetchUser: async () => {
    try {
      const currentLoggedInUserID = await AsyncStorage.getItem(
        "loggedInUserID"
      );
      console.log("currentLoggedInUserID", currentLoggedInUserID);
      const userResponse = await client.get(`/user/${currentLoggedInUserID}`);
      const { data } = userResponse;
      return data;
    } catch (error) {
      console.error("Error fetching user forms:", error);
    }
  },

  formatFormsDate: (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-US", options);
  },

  handleEditDescription: (
    formId,
    description,
    setEditableDescription,
    setEditedDescription
  ) => {
    setEditableDescription(formId);
    setEditedDescription(description);
  },

  handleSaveDescription: async (
    formId,
    editedDescription,
    setEditableDescription,
    user,
    setUser
  ) => {
    try {
      const updatedForms = user.forms.map((post) =>
        form._id === formId ? { ...form, description: editedDescription } : post
      );
      setUser((user) => ({ ...user, forms: updatedForms }));

      await client.put(`/post/${formId}`, { description: editedDescription });

      await client.put(`/user/${user._id}`, { forms: updatedForms });

      console.log(
        `Saving description for form ${formId}: ${editedDescription}`
      );
      setEditableDescription(null);
    } catch (error) {
      console.error("Error saving description:", error);
    }
  },

  handleDeleteform: async (formId, user, setUser) => {
    try {
      const updatedForms = user.forms.filter((post) => form._id !== formId);
      setUser((user) => ({ ...user, forms: updatedForms }));

      await client.delete(`/post/${formId}`);

      await client.put(`/user/${user._id}`, { forms: updatedForms });

      console.log(`Deleting form ${formId}`);
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  },

  handleEditImage: async (formId, user, setUser) => {
    try {
    } catch (error) {
      console.error("Error editing Image:", error);
    }
  },
};
