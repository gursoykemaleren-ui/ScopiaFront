import apiClient from "./apiClient";

export const login = async (username, password) => {
  try {
    console.log("AUTH API ÇALIŞTI", { username, password });

    const response = await apiClient.post("/auth/login", {
      userName: username,
      password,
    });

    console.log("AUTH API RESPONSE STATUS:", response.status);
    console.log("AUTH API RESPONSE DATA:", response.data);

    return response.data;
  } catch (error) {
    console.error("AUTH API ERROR FULL:", error);
    console.error("AUTH API ERROR RESPONSE:", error?.response);
    console.error("AUTH API ERROR RESPONSE DATA:", error?.response?.data);
    throw error;
  }
};