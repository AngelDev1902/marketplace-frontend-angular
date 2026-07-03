export interface AuthLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  uid: string;
  role: string;
  email: string;
  fullName: string;
  status: string;
}

export interface CompleteProfileResponseDto {
  message: string;
  status: string;
}
