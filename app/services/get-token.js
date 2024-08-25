import { cookies } from "next/headers";

export async function getAuthToken() {
  const authToken = cookies().get("token")?.value;
  return authToken;
}