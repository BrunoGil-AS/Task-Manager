import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { apiRoutes } from '../../core/api-routes';

import { UserService } from './user-service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load profile', () => {
    const mockUser = { id: 'u1', email: 'a@a.com', name: 'Bruno' };
    service.getProfile().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiRoutes.tasksApi}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockUser });
  });

  it('should update profile', () => {
    const mockUser = { id: 'u1', email: 'a@a.com', name: 'New Name' };
    service.updateProfile({ name: 'New Name' }).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiRoutes.tasksApi}/users/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'New Name' });
    req.flush({ success: true, data: mockUser });
  });
});
