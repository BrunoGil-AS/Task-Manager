import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * This test suite verifies that Angular's default XSS protection via template interpolation is working as expected.
 * It ensures that potentially dangerous HTML content is properly escaped and not executed when rendered in the template.
 */
@Component({
  selector: 'app-xss-test',
  template: '<div id="target">{{ value }}</div>',
})
class XssTestComponent {
  value = '';
}

describe('XSS protection', () => {
  let fixture: ComponentFixture<XssTestComponent>;
  let component: XssTestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XssTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XssTestComponent);
    component = fixture.componentInstance;
  });

  it('escapes HTML in interpolation', () => {
    // This should be rendered as plain text, not executed HTML.
    component.value = `<img src="x" onerror="alert('xss')" />`;

    fixture.detectChanges();

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    // Ensure no real <img> is created and content is escaped.
    expect(target.querySelector('img')).toBeNull();
    expect(target.innerHTML).toContain('&lt;img');
  });
});
