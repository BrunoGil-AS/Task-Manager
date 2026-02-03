import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileForm } from './profile-form';

describe('UserProfileForm', () => {
  let component: UserProfileForm;
  let fixture: ComponentFixture<UserProfileForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
