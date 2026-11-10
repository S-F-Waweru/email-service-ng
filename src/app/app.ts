import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { ThemeService } from './theme/theme.service';

@Component({
  imports: [RouterOutlet, HlmToaster],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly theme = inject(ThemeService);
  protected readonly toastTheme = computed(() => (this.theme.isDark() ? 'dark' : 'light'));
}
