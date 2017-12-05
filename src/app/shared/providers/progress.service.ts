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
    if (total) {
      this.total = total;
    } else {
      this.total = 100;
    }
  }

  public progress(current: number): number {
    if (this.total !== 0 && this.total > current) {
      const value = 100 * Math.round(Number(current)) / this.total;
      console.log('Setting progress to ' + value);
      this.value = value;
    } else if (this.total <= current) {
      this.end();
    }
    return this.value;
  }

  public end() {
    this.color = 'primary';
    this.mode = 'determinate';
    this.value = 0;
  }

  public increaseSteadily() {
    let remaining = this.total - this.value;
    const increment = this.value + Math.round(Number(remaining / 10));
    remaining = this.progress(increment);
  }
}
