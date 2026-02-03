import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.page.html',
})
export class AuthPage {
  email = '';
  password = '';
  confirmationCode = '';

  isLoginMode = signal(true);
  loading = signal(false);
  needsConfirmation = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.clearMessages();
  }

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    try {
      const result = await this.auth.login(this.email, this.password);

      if (result.success && result.userInfo) {
        this.successMessage.set(`Welcome, ${result.userInfo.email}!`);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      } else {
        this.errorMessage.set(result.error || 'Login failed');
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }

  async register() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    try {
      const result = await this.auth.register(this.email, this.password);

      if (result.userConfirmed) {
        this.successMessage.set('Registration successful! You can now login.');
        this.isLoginMode.set(true);
      } else {
        this.successMessage.set('Registration successful! Check your email for confirmation code.');
        this.needsConfirmation.set(true);
      }
    } catch (error: any) {
      const errorMsg = error?.details || error?.message || 'Registration failed';
      this.errorMessage.set(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }

  async confirmEmail() {
    if (!this.confirmationCode) {
      this.errorMessage.set('Please enter confirmation code');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    try {
      await this.auth.confirmEmail(this.email, this.confirmationCode);

      this.successMessage.set('Email confirmed! You can now login.');
      this.needsConfirmation.set(false);
      this.isLoginMode.set(true);
      this.confirmationCode = '';
    } catch (error: any) {
      const errorMsg = error?.details || error?.message || 'Confirmation failed';
      this.errorMessage.set(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }

  private clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
