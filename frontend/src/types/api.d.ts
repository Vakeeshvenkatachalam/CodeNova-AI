export interface AuthRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface ForgotRequest {
  email: string;
}

export interface ResetRequest {
  token: string;
  password?: string;
}
