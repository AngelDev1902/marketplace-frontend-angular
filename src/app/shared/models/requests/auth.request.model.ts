export interface AuthLoginRequestDto {
  firebaseToken: string;
}

export interface UserRegistrationDto {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  firebaseToken: string;
}

export interface VendorRegistrationDto {
  storeName: string;
  street?: string;
  exteriorNumber?: string;
  zone?: string;
  aisle?: string;
  localNumber?: string;
  latitude?: number;
  longitude?: number;
  sellOnline?: boolean;
}
