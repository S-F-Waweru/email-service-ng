import { inject, Injectable, signal } from '@angular/core';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ThemeService } from '../theme/theme.service';

/** Sets the tab title to "Page · Brand" and exposes the page title for the top bar. */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly theme = inject(ThemeService);
  readonly pageTitle = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? '';
    this.pageTitle.set(title);
    const brand = this.theme.brand().name;
    document.title = title ? `${title} · ${brand}` : brand;
  }
}
