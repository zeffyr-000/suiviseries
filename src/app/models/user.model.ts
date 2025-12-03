import { Notification } from './notification.model';

export interface User {
    id: number;
    google_id: string;
    email: string;
    display_name: string;
    photo_url: string;
    status: UserStatus;
    created_at: string;
    last_login: string;
    notifications?: Notification[];
    notifications_count?: number;
}

export enum UserStatus {
    ACTIVE = 'active',
    DELETED = 'deleted',
    DISABLED = 'disabled'
}

export interface AuthResponse {
    success: boolean;
    user: User;
    token?: string;
    message?: string;
}

export interface InitResponse {
    success: boolean;
    authenticated: boolean;
    user?: User;
    app_config?: {
        version: string;
        features: string[];
    };
    message?: string;
}

export interface AuthRequest {
    credential: string;
}

export interface GoogleAuthResponse {
    credential: string;
    select_by: string;
}

export interface TokenPayload {
    user_id: number;
    email: string;
    exp: number;
    iat: number;
}

export interface GoogleTokenPayload {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    exp: number;
    iat: number;
    aud: string;
    iss: string;
}