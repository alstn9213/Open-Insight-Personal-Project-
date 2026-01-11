import type { LoginRequest, SignupRequest, TokenResponse } from "../types/auth";
import axiosClient from "./axiosClient";

export const authApi = {
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await axiosClient.post<TokenResponse>("/auth/login", data);
        return response.data;
    },

    signup: async (data: SignupRequest): Promise<string> => {
        // 백엔드에서 String을 반환("회원 가입 성공")
        const response = await axiosClient.post<string>("/members/signup", data);
        return response.data;
    }
}