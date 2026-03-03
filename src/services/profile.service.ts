import { api } from "./api";
import { ProfileData } from "@/types/profile";

export interface ProfileResponse extends ProfileData {
  userId: number;
}

/**
 * Profile service
 * ===============
 * Responsible for fetching the currently authenticated user's profile.
 *
 * The backend should identify the user from the authentication mechanism
 * (cookie / JWT) so the frontend only calls `/profile/me` without IDs.
 */

const PROFILE_BASE_PATH =   process.env.NEXT_PUBLIC_API_URL;

export const profileService = {
  /**
   * Get current user's profile.
   *
   * GET `${API_BASE_URL}/profile/me`
   */
  async getMyProfile(): Promise<ProfileResponse> {
    const res = await api.get<ProfileResponse>(`${PROFILE_BASE_PATH}/auth/me`);
    return res.data;
  },
};

