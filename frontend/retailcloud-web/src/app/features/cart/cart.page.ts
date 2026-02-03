import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.page.html',
})
export class CartPage {
  loading = signal(false);
  busy = signal(false);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);
  checkoutResult = signal<any | null>(null);

  items = signal<any[]>([]);

  subtotal = computed(() =>
    this.items().reduce((sum, it) => sum + (Number(it?.price ?? 0) * Number(it?.qty ?? 0)), 0)
  );

  constructor(
    private cart: CartService,
    private orders: OrdersService,
    private router: Router,
    public auth: AuthService
  ) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.toast.set(null);

    this.cart.getCart().subscribe({
      next: (res) => {
        const list =
          Array.isArray(res) ? res :
            Array.isArray((res as any)?.items) ? (res as any).items :
              Array.isArray((res as any)?.cartItems) ? (res as any).cartItems :
                [];

        const normalized = list.map((it: any) => ({
          productId: it.productId ?? it.id,
          name: it.name ?? it.title,
          price: Number(it.price ?? 0),
          qty: Number(it.qty ?? 0),
        }));

        this.items.set(normalized);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.message || 'Failed to load cart.');
      }
    });
  }

  remove(productId: string) {
    if (!productId) return;

    this.busy.set(true);
    this.error.set(null);
    this.toast.set(null);

    this.cart.removeItem(productId).subscribe({
      next: () => {
        this.items.set(this.items().filter(x => x.productId !== productId));
        this.busy.set(false);
        this.toast.set('Item removed ');
        setTimeout(() => this.toast.set(null), 2000);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e?.message || 'Failed to remove item.');
      }
    });
  }

  clear() {
    this.busy.set(true);
    this.error.set(null);
    this.toast.set(null);

    this.cart.clearCart().subscribe({
      next: () => {
        this.items.set([]);
        this.busy.set(false);
        this.toast.set('Cart cleared ');
        setTimeout(() => this.toast.set(null), 2000);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e?.message || 'Failed to clear cart.');
      }
    });
  }

  checkout() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.toast.set(null);
    this.checkoutResult.set(null);

    this.orders.checkout().subscribe({
      next: (res) => {
        this.checkoutResult.set(res);
        this.cart.clearCart().subscribe({ next: () => { } });

        this.items.set([]);
        this.busy.set(false);

        const orderId = res?.order?.orderId;

        if (orderId) {
          setTimeout(() => this.router.navigate(['/payment', orderId]), 800);
        } else {

          setTimeout(() => this.router.navigateByUrl('/orders'), 800);
        }
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e?.message || 'Checkout failed.');
      }
    });
  }

  money(v: number) {
    return (Math.round((v + Number.EPSILON) * 100) / 100).toFixed(2);
  }
}
