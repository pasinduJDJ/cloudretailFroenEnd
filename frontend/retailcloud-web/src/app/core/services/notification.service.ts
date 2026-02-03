import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderConfirmationData {
    email: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
}

export interface NotificationResponse {
    message: string;
    type: string;
    toEmail: string;
}

/**
 * NotificationService
 * Handles all notification-related API calls (email notifications)
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly API_URL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Send order confirmation email
     * Called after successful payment
     */
    sendOrderConfirmation(data: OrderConfirmationData): Observable<NotificationResponse> {
        const url = `${this.API_URL}/notifications/order-confirmed`;

        console.log('📧 Sending order confirmation email:', data);

        return this.http.post<NotificationResponse>(url, data);
    }

    /**
     * Send welcome email after user registration
     * Future use
     */
    sendWelcomeEmail(email: string, userId: string): Observable<NotificationResponse> {
        const url = `${this.API_URL}/notifications/user-registered`;

        console.log('📧 Sending welcome email:', { email, userId });

        return this.http.post<NotificationResponse>(url, { email, userId });
    }

    /**
     * Send payment failed notification
     * Future use
     */
    sendPaymentFailed(email: string, userId: string, orderId: string): Observable<NotificationResponse> {
        const url = `${this.API_URL}/notifications/payment-failed`;

        console.log('📧 Sending payment failed email:', { email, userId, orderId });

        return this.http.post<NotificationResponse>(url, { email, userId, orderId });
    }
}
