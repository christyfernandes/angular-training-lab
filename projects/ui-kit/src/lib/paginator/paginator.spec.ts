import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';

describe('Paginator', () => {
  let fixture: ComponentFixture<Paginator>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Paginator);
    host = fixture.nativeElement;
    // Signal inputs are set through the ComponentRef in tests.
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('pageSize', 10);
    await fixture.whenStable();
  });

  it('renders an ellipsis window for many pages', () => {
    const labels = [...host.querySelectorAll('button')].map((b) => b.textContent?.trim());
    // Page 1 of 10 → Previous, 1, 2, …, 10, Next
    expect(labels).toEqual(['Previous', '1', '2', '10', 'Next']);
    expect(host.textContent).toContain('…');
  });

  it('updates the page model and disables Previous on page 1', async () => {
    const buttons = host.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons[0].disabled).toBe(true);

    const emitted: number[] = [];
    fixture.componentInstance.page.subscribe((p) => emitted.push(p));

    buttons[buttons.length - 1].click(); // Next
    await fixture.whenStable();

    expect(fixture.componentInstance.page()).toBe(2);
    expect(emitted).toEqual([2]);
  });

  it('renders nothing when everything fits on one page', async () => {
    fixture.componentRef.setInput('total', 5);
    await fixture.whenStable();
    expect(host.querySelector('nav')).toBeNull();
  });
});
