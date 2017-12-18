import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ProgressService {
  public color$ = new Subject<string>();
  public mode$ = new Subject<string>();
  public value$ = new Subject<number>();

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

    this.color$.next(this.color);
    this.mode$.next(this.mode);
    this.value$.next(this.value);
  }

  public progress(current: number): number {
    if (this.total !== 0 && this.total > current) {
      const value = 100 * Math.round(Number(current)) / this.total;
      console.log('Setting progress to ' + value);
      this.value = value;
    } else if (this.total <= current) {
      this.end();
    }
    this.value$.next(this.value);
    return this.value;
  }

  public end() {
    this.color = 'primary';
    this.mode = 'determinate';
    this.value = 0;
    this.color$.next(this.color);
    this.mode$.next(this.mode);
    this.value$.next(this.value);
  }

  public increaseSteadily() {
    let remaining = this.total - this.value;
    const increment = this.value + Math.round(Number(remaining / 10));
    remaining = this.progress(increment);
  }
}
