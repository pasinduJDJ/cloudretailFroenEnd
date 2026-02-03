import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
    constructor(
        private api: ApiClient,
        private auth: AuthService
    ) { }

    checkout(userId = environment.demoUserId) {
        // Get user email from auth service
        const userInfo = this.auth.getCurrentUser();
        const email = userInfo?.email || 'jdipasindudulanjana@gmail.com'; // Fallback to verified email

        console.log('🛒 Checkout with email:', email);

        // Pass email in request body
        return this.api.post<any>('/orders/checkout', { email }, { userId });
    }

    list(userId = environment.demoUserId) {
        return this.api.get<any>('/orders', { userId });
    }
}
