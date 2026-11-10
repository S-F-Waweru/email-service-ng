import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucidePencil, lucidePlus, lucideSend, lucideUndo2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { isSender } from '../../shared/forms/validators';
import { type CompanySite, MAX_CC } from './companies.models';
import { CompaniesStore } from './companies.store';

/** One company: name and sender (editable), recipient (read-only) and CC list. */
@Component({
  selector: 'app-company-cc-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmInputGroupImports,
    HlmLabel,
    HlmSpinner,
  ],
  providers: [provideIcons({ lucideMail, lucidePencil, lucidePlus, lucideSend, lucideUndo2, lucideX })],
  templateUrl: './company-cc-card.html',
})
export class CompanyCcCard {
  protected readonly store = inject(CompaniesStore);
  readonly site = input.required<CompanySite>();

  protected readonly max = MAX_CC;
  protected readonly draft = signal('');
  protected readonly inputError = signal('');
  protected readonly confirming = signal(false);

  protected readonly cc = computed(() => this.store.ccFor(this.site().id));
  protected readonly dirty = computed(() => this.store.isDirty(this.site().id));
  protected readonly changes = computed(() => this.store.changes(this.site().id));
  protected readonly saving = computed(() => this.store.saving() === this.site().id);
  protected readonly full = computed(() => this.cc().length >= MAX_CC);
  protected readonly inputId = computed(() => `cc-input-${this.site().id}`);

  // ---- Name and sender ----------------------------------------------------

  protected readonly editingDetails = signal(false);
  protected readonly nameDraft = signal('');
  protected readonly fromDraft = signal('');
  protected readonly detailsTouched = signal(false);

  protected readonly nameError = computed(() => {
    const name = this.nameDraft().trim();
    if (!name) return 'Enter a name.';
    if (name.length > 150) return 'At most 150 characters.';
    return null;
  });

  protected readonly fromError = computed(() => {
    const from = this.fromDraft().trim();
    if (!from) {
      return this.site().hasOwnSmtp ? 'Required: this company sends through its own mail server.' : null;
    }
    if (from.length > 320 || !isSender(from)) return 'Use an email address, optionally with a name: Acme <no-reply@acme.com>.';
    return null;
  });

  protected editDetails(): void {
    this.nameDraft.set(this.site().name);
    this.fromDraft.set(this.site().from ?? '');
    this.detailsTouched.set(false);
    this.editingDetails.set(true);
  }

  protected cancelDetails(): void {
    this.editingDetails.set(false);
  }

  protected async saveDetails(): Promise<void> {
    this.detailsTouched.set(true);
    if (this.nameError() || this.fromError()) return;
    const name = this.nameDraft().trim();
    const from = this.fromDraft().trim() || null;
    const site = this.site();
    // Send only what changed.
    const input = {
      ...(name !== site.name ? { name } : {}),
      ...(from !== site.from ? { from } : {}),
    };
    if (Object.keys(input).length === 0) {
      this.editingDetails.set(false);
      return;
    }
    if (await this.store.updateSettings(site.id, input)) this.editingDetails.set(false);
  }

  // ---- CC list ------------------------------------------------------------

  /** Enter, comma, space or paste of several addresses. */
  protected add(): void {
    const parts = this.draft().split(/[\s,;]+/).filter(Boolean);
    if (parts.length === 0) return;
    for (const part of parts) {
      const error = this.store.addCc(this.site().id, part);
      if (error) {
        this.inputError.set(`${part}: ${error}`);
        this.draft.set(parts.slice(parts.indexOf(part)).join(', '));
        return;
      }
    }
    this.inputError.set('');
    this.draft.set('');
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.add();
    } else if (event.key === 'Backspace' && !this.draft() && this.cc().length) {
      // Backspace in an empty box removes the last chip, like most tag inputs.
      this.remove(this.cc()[this.cc().length - 1]);
    }
  }

  protected onInput(value: string): void {
    this.draft.set(value);
    if (this.inputError()) this.inputError.set('');
  }

  protected remove(email: string): void {
    this.store.removeCc(this.site().id, email);
  }

  protected discard(): void {
    this.store.discard(this.site().id);
    this.draft.set('');
    this.inputError.set('');
  }

  protected async confirmSave(): Promise<void> {
    if (await this.store.save(this.site().id)) this.confirming.set(false);
  }

  protected onDialogState(state: string): void {
    if (state === 'closed') this.confirming.set(false);
  }
}
