import AsyncStorage from "@react-native-async-storage/async-storage";

// Token persistence. Using AsyncStorage for now (already a project dependency).
// NOTE: for production, migrate to `expo-secure-store` so tokens are stored in
// the device keychain/keystore rather than plain AsyncStorage.

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, accessToken],
    [REFRESH_KEY, refreshToken],
  ]);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}
