import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiRoutes } from '../../core/api-routes';
import type { AuthUser } from '../../auth/models/auth.model';

interface UserApiResponse {
  success: boolean;
  data: AuthUser;
  message?: string;
}

export interface UpdateUserPayload {
  name: string;
}

/**
 * Client service for authenticated user profile API operations.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private baseUrl = `${apiRoutes.tasksApi}/users`;

  /**
   * Fetches the current authenticated user profile.
   */
  getProfile(): Observable<AuthUser> {
    return this.http
      .get<UserApiResponse>(`${this.baseUrl}/me`)
      .pipe(map((res) => res.data));
  }

  /**
   * Updates mutable profile fields for the authenticated user.
   */
  updateProfile(payload: UpdateUserPayload): Observable<AuthUser> {
    return this.http
      .put<UserApiResponse>(`${this.baseUrl}/me`, payload)
      .pipe(map((res) => res.data));
  }
}
