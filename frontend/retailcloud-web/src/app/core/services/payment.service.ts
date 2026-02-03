import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentRequest {
    orderId: string;
    status: 'SUCCESS' | 'FAILED';
}

export interface PaymentResponse {
    message: string;
    payment: {
        paymentId: string;
        orderId: string;
        userId: string;
        amount: number;
        currency: string;
        status: string;
        provider: string;
        createdAt: string;
    };
    orderUpdate: {
        orderId: string;
        status: string;
    };
    inventoryRelease?: {
        attempted: boolean;
        released?: any[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly API_URL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    processPayment(orderId: string): Observable<PaymentResponse> {
        const url = `${this.API_URL}/payments`;
        const body: PaymentRequest = {
            orderId,
            status: 'SUCCESS'
        };

        console.log('Processing payment for order:', orderId);
        console.log('Payment request:', body);

        return this.http.post<PaymentResponse>(url, body);
    }

    getPayment(paymentId: string): Observable<any> {
        const url = `${this.API_URL}/payments/${paymentId}`;
        return this.http.get(url);
    }
}
