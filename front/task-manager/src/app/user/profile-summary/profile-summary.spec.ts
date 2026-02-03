import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSummary } from './profile-summary';

describe('UserProfileSummary', () => {
  let component: UserProfileSummary;
  let fixture: ComponentFixture<UserProfileSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileSummary);
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
