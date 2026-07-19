import { api } from "./api";
import { ProfileData } from "@/types/profile";

export interface ProfileResponse extends ProfileData {
  userId: number;
  email?: string;
}

/**
 * Profile service
 * ===============
 * Responsible for fetching the currently authenticated user's profile.
 */
export const profileService = {
  /**
   * Get current user's profile.
   * GET `/api/Auth/me`
   */
  async getMyProfile(): Promise<ProfileResponse> {
    const res = await api.get<ProfileResponse>("/Auth/me");
    return res.data;
  },
};
