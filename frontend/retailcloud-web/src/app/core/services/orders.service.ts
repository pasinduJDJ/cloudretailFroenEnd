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
        const userInfo = this.auth.getCurrentUser();
        const email = userInfo?.email || 'pasindudulanjanarj@gmail.com';

        console.log('Checkout with email:', email);

        return this.api.post<any>('/orders/checkout', { email }, { userId });
    }

    list(userId = environment.demoUserId) {
        return this.api.get<any>('/orders', { userId });
    }
}
