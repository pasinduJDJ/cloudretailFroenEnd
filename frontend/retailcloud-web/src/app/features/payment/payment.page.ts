import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
    standalone: true,
    selector: 'app-payment',
    imports: [CommonModule, RouterLink],
    template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-xl-5">

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">

              <!-- Header -->
              <div class="text-center mb-4">
                <div class="display-6 fw-bold">💳 Complete Payment</div>
                <div class="text-muted">Cash on Delivery (COD)</div>
              </div>

              <!-- Success Message -->
              @if (successMessage()) {
                <div class="alert alert-success alert-dismissible fade show">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ successMessage() }}
                </div>
              }

              <!-- Error Message -->
              @if (errorMessage()) {
                <div class="alert alert-danger alert-dismissible fade show">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ errorMessage() }}
                  <button type="button" class="btn-close" (click)="errorMessage.set('')"></button>
                </div>
              }

              <!-- Loading State -->
              @if (loading()) {
                <div class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <div class="mt-3 text-muted">Loading order details...</div>
                </div>
              }

              <!-- Order Details -->
              @if (!loading() && orderDetails()) {
                <div class="mb-4">
                  <div class="card bg-light border-0">
                    <div class="card-body">
                      <h6 class="fw-bold mb-3">Order Summary</h6>
                      
                      <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Order ID:</span>
                        <span class="fw-semibold font-monospace small">{{ orderDetails()?.orderId }}</span>
                      </div>

                      <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Status:</span>
                        <span class="badge bg-warning text-dark">{{ orderDetails()?.status }}</span>
                      </div>

                      <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Items:</span>
                        <span>{{ orderDetails()?.items?.length || 0 }} item(s)</span>
                      </div>

                      <hr class="my-3">

                      <div class="d-flex justify-content-between">
                        <span class="fw-bold">Total Amount:</span>
                        <span class="fw-bold text-primary fs-5">
                          \${{ formatMoney(orderDetails()?.totalAmount || 0) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Items List (Optional) -->
                @if (orderDetails()?.items && orderDetails()?.items.length > 0) {
                  <div class="mb-4">
                    <h6 class="fw-bold mb-3">Items</h6>
                    <div class="list-group">
                      @for (item of orderDetails()?.items; track item.productId) {
                        <div class="list-group-item">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <div class="fw-semibold">{{ item.name || item.productId }}</div>
                              <div class="small text-muted">Qty: {{ item.qty }}</div>
                            </div>
                            <div class="fw-semibold">\${{ formatMoney(item.price * item.qty) }}</div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Payment Button -->
                <div class="d-grid gap-2">
                  <button 
                    class="btn btn-success btn-lg"
                    (click)="processPayment()"
                    [disabled]="processing()">
                    @if (processing()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    } @else {
                      <i class="bi bi-cash-coin me-2"></i>
                      Pay with Cash (COD)
                    }
                  </button>

                  <button 
                    class="btn btn-outline-secondary"
                    routerLink="/cart"
                    [disabled]="processing()">
                    <i class="bi bi-arrow-left me-2"></i>
                    Back to Cart
                  </button>
                </div>

                <!-- Info -->
                <div class="alert alert-info mt-4 mb-0 small">
                  <i class="bi bi-info-circle me-2"></i>
                  <strong>Cash on Delivery:</strong> Pay when you receive your order. 
                  No online payment required.
                </div>
              }

            </div>
          </div>

          <div class="text-center text-muted small mt-3">
            <i class="bi bi-shield-check me-1"></i>
            Secure Payment Processing
          </div>

        </div>
      </div>
    </div>
  `,
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
        // Get order ID from route params
        const id = this.route.snapshot.paramMap.get('orderId');

        if (!id) {
            this.errorMessage.set('No order ID provided');
            setTimeout(() => this.router.navigate(['/cart']), 2000);
            return;
        }

        this.orderId.set(id);
        this.loadOrderDetails(id);
    }

    /**
     * Load order details to display summary
     */
    loadOrderDetails(orderId: string) {
        this.loading.set(true);
        this.errorMessage.set('');

        // Get all orders and find the one we need
        this.ordersService.list().subscribe({
            next: (response: any) => {
                const orders = response?.items || [];
                const order = orders.find((o: any) => o.orderId === orderId);

                if (order) {
                    this.orderDetails.set(order);
                    console.log('✅ Order details loaded:', order);
                } else {
                    this.errorMessage.set('Order not found');
                }
                this.loading.set(false);
            },
            error: (error: any) => {
                console.error('❌ Failed to load order:', error);
                this.errorMessage.set('Failed to load order details');
                this.loading.set(false);
            }
        });
    }

    /**
     * Process payment (Cash on Delivery)
     */
    processPayment() {
        const id = this.orderId();
        if (!id) {
            this.errorMessage.set('Invalid order ID');
            return;
        }

        this.processing.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');

        console.log('💳 Processing payment for order:', id);

        this.paymentService.processPayment(id).subscribe({
            next: (response) => {
                console.log('✅ Payment successful:', response);

                this.successMessage.set('Payment successful! Order confirmed. Redirecting to home...');
                this.processing.set(false);

                // Redirect to home page after 2 seconds
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
                console.error('❌ Payment failed:', error);

                const errorMsg = error?.error?.message || error?.message || 'Payment processing failed';
                this.errorMessage.set(errorMsg);
                this.processing.set(false);
            }
        });
    }

    /**
     * Format money with 2 decimal places
     */
    formatMoney(amount: number): string {
        return (Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2);
    }
}
