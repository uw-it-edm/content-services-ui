import { Injectable } from '@angular/core';

@Injectable()
export class ProgressService {
  color: string;
  mode: string;
  value: number;
  total: number;

  constructor() {
    this.color = 'primary';
    this.mode = 'determinate';
    this.value = 0;
    this.total = 100;
  }

  public start(mode?: string, color?: string, total?: number) {
    this.value = 20;
    if (mode == null) {
      this.mode = 'indeterminate';
    } else {
      this.mode = mode;
    }
    if (color == null) {
      this.color = 'primary';
    } else {
      this.color = color;
    }
    if (total !== null) {
      this.total = total;
    } else {
      this.total = 100;
    }

    // if (this.mode === 'determinate') {
    //   this.increaseSteadily();
    // }
  }

  public progress(current: number) {
    if (this.total !== 0 && this.total > current) {
      const value = 100 * (current / this.total);
      console.log('Setting progress to ' + value);
      this.value = value;
    }
  }

  public end() {
    this.color = 'primary';
    this.mode = 'determinate';
    this.value = 0;
  }

  private increaseSteadily() {
    const remaining = this.total - this.value;
    const increment = remaining / 20;
    this.progress(increment);
    if (remaining > 0) {
      setTimeout(this.increaseSteadily, 100);
    }
  }
}
