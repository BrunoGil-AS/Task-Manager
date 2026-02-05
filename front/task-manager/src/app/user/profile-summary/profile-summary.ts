import { Component, input, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import type { AuthUser } from '../../auth/models/auth.model';

@Component({
  selector: 'app-user-profile-summary',
  templateUrl: './profile-summary.html',
  styleUrl: './profile-summary.css',
})
export class UserProfileSummary {
  private authService = inject(AuthService);

  user = input.required<AuthUser>();
}
