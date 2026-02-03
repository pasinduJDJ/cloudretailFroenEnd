import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  standalone: true,
  selector: 'app-payment',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment.page.html',
})
export class PaymentPage implements OnInit {
  orderId = signal<string | null>(null);
  orderDetails = signal<any>(null);
  loading = signal(false);
  processing = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private ordersService: OrdersService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orderId');

    if (!id) {
      this.errorMessage.set('No order ID provided');
      setTimeout(() => this.router.navigate(['/cart']), 2000);
      return;
    }

    this.orderId.set(id);
    this.loadOrderDetails(id);
  }

  loadOrderDetails(orderId: string) {
    this.loading.set(true);
    this.errorMessage.set('');

    this.ordersService.list().subscribe({
      next: (response: any) => {
        const orders = response?.items || [];
        const order = orders.find((o: any) => o.orderId === orderId);

        if (order) {
          this.orderDetails.set(order);
          console.log('Order details loaded:', order);
        } else {
          this.errorMessage.set('Order not found');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load order:', error);
        this.errorMessage.set('Failed to load order details');
        this.loading.set(false);
      }
    });
  }

  processPayment() {
    const id = this.orderId();
    if (!id) {
      this.errorMessage.set('Invalid order ID');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    console.log('Processing payment for order:', id);

    this.paymentService.processPayment(id).subscribe({
      next: (response) => {
        console.log('Payment successful:', response);

        this.successMessage.set('Payment successful! Order confirmed. Redirecting to home...');
        this.processing.set(false);

        setTimeout(() => {
          this.router.navigate(['/'], {
            queryParams: {
              paymentSuccess: 'true',
              orderId: id
            }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Payment failed:', error);

        const errorMsg = error?.error?.message || error?.message || 'Payment processing failed';
        this.errorMessage.set(errorMsg);
        this.processing.set(false);
      }
    });
  }

  formatMoney(amount: number): string {
    return (Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2);
  }
}
