import { AsyncPipe } from '@angular/common';
import { AuthService } from './../../auth/auth.service';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Top navigation component for authenticated app navigation.
 */
@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  /**
   * Navigates to a target application route.
   */
  navigate(path: string) {
    this.router.navigate([path]);
  }
}
