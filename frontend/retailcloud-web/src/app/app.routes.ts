import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/home/home.page').then(m => m.HomePage) },
    { path: 'products', loadComponent: () => import('./features/products/products.page').then(m => m.ProductsPage) },
    { path: 'products/:id', loadComponent: () => import('./features/products/product-details.page').then(m => m.ProductDetailsPage) },

    { path: 'cart', loadComponent: () => import('./features/cart/cart.page').then(m => m.CartPage) },
    { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.page').then(m => m.CheckoutPage) },
    { path: 'payment/:orderId', loadComponent: () => import('./features/payment/payment.page').then(m => m.PaymentPage) },
    { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/orders/orders.page').then(m => m.OrdersPage) },

    { path: 'auth', loadComponent: () => import('./features/auth/auth.page').then(m => m.AuthPage) },
    { path: 'auth/callback', loadComponent: () => import('./features/auth/auth-callback.page').then(m => m.AuthCallbackPage) },

    { path: '**', redirectTo: '' },



];
