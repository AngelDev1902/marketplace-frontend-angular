import { Component } from '@angular/core';

@Component({
  selector: 'app-logo-primary',
  imports: [],
  template: `
    <!-- Logo -->
    <a href="#" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div
        class="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
      >
        C
      </div>
      <span class="text-2xl font-bold tracking-tight text-white">
        Chiconcuac<span class="text-sky-400">Market</span>
        <span
          class="ml-2 text-xs font-medium bg-white/20 text-white px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm"
          >Partners</span
        >
      </span>
    </a>
  `,
})
export class LogoPrimary {}
