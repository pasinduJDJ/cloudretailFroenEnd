import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiClient } from '../api/api-client.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
    private cartCountSubject = new BehaviorSubject<number>(0);
    public cartCount$ = this.cartCountSubject.asObservable();

    constructor(private api: ApiClient) {
        this.refreshCartCount();
    }

    getCart(userId = environment.demoUserId) {
        return this.api.get<any>('/cart', { userId });
    }

    addItem(productId: string, qty: number, price: number, userId = environment.demoUserId) {
        return this.api.post<any>('/cart/items', { productId, qty, price }, { userId }).pipe(
            tap(() => this.refreshCartCount())
        );
    }

    removeItem(productId: string, userId = environment.demoUserId) {
        return this.api.delete<any>(`/cart/items/${productId}`, { userId }).pipe(
            tap(() => this.refreshCartCount())
        );
    }

    clearCart(userId = environment.demoUserId) {
        return this.api.delete<any>('/cart', { userId }).pipe(
            tap(() => this.refreshCartCount())
        );
    }

    refreshCartCount(userId = environment.demoUserId) {
        this.getCart(userId).subscribe({
            next: (res) => {
                const items =
                    Array.isArray(res) ? res :
                        Array.isArray((res as any)?.items) ? (res as any).items :
                            Array.isArray((res as any)?.cartItems) ? (res as any).cartItems :
                                [];

                const totalQty = items.reduce((sum: number, item: any) => {
                    return sum + (Number(item?.qty) || 0);
                }, 0);

                this.cartCountSubject.next(totalQty);
            },
            error: () => {
                this.cartCountSubject.next(0);
            }
        });
    }

    async updateQty(removeFirst: () => Promise<any>, addAgain: () => Promise<any>) {
        await removeFirst();
        await addAgain();
    }
}
