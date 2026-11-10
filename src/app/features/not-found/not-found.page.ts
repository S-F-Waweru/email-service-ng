import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCompass } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, HlmButton, HlmEmptyImports],
  providers: [provideIcons({ lucideCompass })],
  template: `
    <div hlmEmpty class="min-h-[60svh]">
      <div hlmEmptyHeader>
        <div hlmEmptyMedia variant="icon"><ng-icon name="lucideCompass" /></div>
        <div hlmEmptyTitle>Page not found</div>
        <div hlmEmptyDescription>The page you're looking for doesn't exist or was moved.</div>
      </div>
      <div hlmEmptyContent>
        <a hlmBtn routerLink="/">Back to requests</a>
      </div>
    </div>
  `,
})
export class NotFoundPage {}
