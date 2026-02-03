import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.page.html',
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #001D3D 0%, #003566 100%);
      color: white;
      padding: 80px 0;
      margin-bottom: 60px;
    }

    .feature-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .stat-card {
      background: linear-gradient(135deg, #FFC300 0%, #FFD60A 100%);
      border-radius: 15px;
      padding: 30px;
      text-align: center;
      color: #001D3D;
    }

    .product-card {
      transition: transform 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: scale(1.05);
    }
  `]
})
export class HomePage implements OnInit {
  paymentSuccess = signal(false);
  orderId = signal('');
  featuredProducts = signal<any[]>([]);
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['paymentSuccess'] === 'true') {
        this.paymentSuccess.set(true);
        this.orderId.set(params['orderId'] || '');
        setTimeout(() => this.dismissAlert(), 10000);
      }
    });

    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.loading.set(true);
    this.productsService.list().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res :
          Array.isArray((res as any)?.items) ? (res as any).items :
            Array.isArray((res as any)?.products) ? (res as any).products : [];

        this.featuredProducts.set(list.slice(0, 4));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  dismissAlert() {
    this.paymentSuccess.set(false);
  }
}
