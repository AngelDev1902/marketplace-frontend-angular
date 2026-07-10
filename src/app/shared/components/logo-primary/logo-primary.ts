import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-logo-primary',
  standalone: true,
  template: `
    <div class="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div
        class="bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold"
        [class]="logoClasses()"
      >
        C
      </div>

      <span
        class="font-bold tracking-tight text-white"
        [class]="textClasses()"
      >
        Chiconcuac<span class="text-sky-400">Market</span>
      </span>
    </div>
  `,
})
export class LogoPrimary {
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  readonly logoClasses = computed(() => {
    switch (this.size()) {
      case 'small':
        return 'w-6 h-6 text-sm';
      case 'large':
        return 'w-10 h-10 text-lg';
      default:
        return 'w-8 h-8 text-base';
    }
  });

  readonly textClasses = computed(() => {
    switch (this.size()) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  });
}