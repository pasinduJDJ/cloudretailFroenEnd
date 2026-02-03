import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserInfo {
    sub: string;
    email: string;
    email_verified?: boolean;
    'cognito:username'?: string;
    [key: string]: any;
}

export interface LoginResponse {
    message: string;
    tokens: {
        accessToken: string;
        idToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
    };
}

export interface RegisterResponse {
    message: string;
    userConfirmed: boolean;
    userSub: string;
}

export interface ConfirmResponse {
    message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API_URL = environment.apiUrl || 'https://bizvx23zvj.execute-api.ap-southeast-1.amazonaws.com/dev';

    isLoggedIn = signal<boolean>(false);
    currentUser = signal<UserInfo | null>(null);

    constructor(private http: HttpClient) {
        this.isLoggedIn.set(this.hasValidToken());
        this.currentUser.set(this.getUserFromToken());
    }


    private decodeToken(token: string): UserInfo | null {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    }

    async register(email: string, password: string): Promise<RegisterResponse> {
        try {
            const url = `${this.API_URL}/auth/register`;
            const body = { email, password };

            console.log('Attempting registration to:', url);
            console.log('Request body:', body);

            const response = await firstValueFrom(
                this.http.post<RegisterResponse>(url, body, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );

            console.log('Registration response:', response);
            return response;
        } catch (error: any) {
            console.error('Registration failed - Full error:', error);
            console.error('Error status:', error?.status);
            console.error('Error message:', error?.message);
            console.error('Error details:', error?.error);

            throw {
                message: error?.error?.message || error?.message || 'Registration failed',
                error: error?.error?.error || 'Unknown error',
                details: error?.error?.details || error?.statusText || 'Please try again'
            };
        }
    }

    async confirmEmail(email: string, code: string): Promise<ConfirmResponse> {
        const url = `${this.API_URL}/auth/confirm`;
        const body = { email, code };

        const response = await firstValueFrom(
            this.http.post<ConfirmResponse>(url, body)
        );

        return response;
    }


    async login(email: string, password: string): Promise<{ success: boolean; userInfo: UserInfo | null; error?: string }> {
        try {
            const url = `${this.API_URL}/auth/login`;
            const body = { email, password };

            console.log('Attempting login to:', url);
            console.log('Request body:', body);

            const response = await firstValueFrom(
                this.http.post<LoginResponse>(url, body, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );

            console.log('Response received:', response);

            if (response.tokens) {
                localStorage.setItem('accessToken', response.tokens.accessToken);
                localStorage.setItem('idToken', response.tokens.idToken);
                localStorage.setItem('refreshToken', response.tokens.refreshToken);

                const userInfo = this.decodeToken(response.tokens.idToken);

                if (userInfo) {
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    this.currentUser.set(userInfo);
                    this.isLoggedIn.set(true);

                    console.log('Login successful:', userInfo);
                    return { success: true, userInfo };
                }
            }

            return { success: false, userInfo: null, error: 'Failed to decode user info' };
        } catch (error: any) {
            console.error('Login failed - Full error:', error);
            console.error('Error status:', error?.status);
            console.error('Error message:', error?.message);
            console.error('Error details:', error?.error);

            return {
                success: false,
                userInfo: null,
                error: error?.error?.message || error?.message || 'Login failed'
            };
        }
    }


    async logout() {
        try {
            const url = `${this.API_URL}/auth/logout`;

            await firstValueFrom(
                this.http.post(url, {})
            );
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');

            this.currentUser.set(null);
            this.isLoggedIn.set(false);

            console.log('Logged out successfully');
        }
    }

    getCurrentUser(): UserInfo | null {
        return this.getUserFromToken();
    }


    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getIdToken(): string | null {
        return localStorage.getItem('idToken');
    }


    setToken(token: string) {
        localStorage.setItem('idToken', token);
        localStorage.setItem('accessToken', token);

        const userInfo = this.decodeToken(token);
        if (userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            this.currentUser.set(userInfo);
        }

        this.isLoggedIn.set(true);
    }


    private hasValidToken(): boolean {
        const token = localStorage.getItem('idToken');
        if (!token) return false;

        const userInfo = this.decodeToken(token);
        if (!userInfo) return false;

        const exp = userInfo['exp'];
        if (exp && exp * 1000 < Date.now()) {
            console.log('Token expired');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            return false;
        }

        return true;
    }

    private getUserFromToken(): UserInfo | null {
        const token = localStorage.getItem('idToken');
        if (!token) return null;

        const userInfo = this.decodeToken(token);
        if (!userInfo) return null;

        const exp = userInfo['exp'];
        if (exp && exp * 1000 < Date.now()) {
            return null;
        }

        return userInfo;
    }


    isTokenExpired(): boolean {
        const idToken = this.getIdToken();
        if (!idToken) return true;

        const userInfo = this.decodeToken(idToken);
        if (!userInfo || !userInfo['exp']) return true;

        return userInfo['exp'] * 1000 < Date.now();
    }
}
