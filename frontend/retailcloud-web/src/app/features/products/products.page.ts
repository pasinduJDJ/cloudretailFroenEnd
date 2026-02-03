import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './products.page.html',
})
export class ProductsPage {
  query = '';
  loading = signal(false);
  adding = signal(false);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);

  products = signal<any[]>([]);

  filtered = computed(() => {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p => {
      const name = (p?.name || p?.title || '').toLowerCase();
      const id = String(p?.productId || p?.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  });

  constructor(private productsService: ProductsService, private cart: CartService) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.toast.set(null);

    this.productsService.list().subscribe({
      next: (res) => {
        const list =
          Array.isArray(res) ? res :
            Array.isArray((res as any)?.items) ? (res as any).items :
              Array.isArray((res as any)?.products) ? (res as any).products :
                [];

        this.products.set(list);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.message || 'Failed to load products.');
      }
    });
  }

  addToCart(product: any) {
    const productId = product?.productId || product?.id;
    const price = Number(product?.price ?? 0);

    if (!productId) {
      this.error.set('Product ID missing from API response. Check /products response fields.');
      return;
    }

    this.adding.set(true);
    this.error.set(null);
    this.toast.set(null);

    this.cart.addItem(String(productId), 1, price).subscribe({
      next: () => {
        this.adding.set(false);
        this.toast.set(`Added ${product?.name || product?.title || productId} to cart`);

        setTimeout(() => this.toast.set(null), 2500);
      },
      error: (e) => {
        this.adding.set(false);
        this.error.set(e?.message || 'Failed to add to cart.');
      }
    });
  }
}
