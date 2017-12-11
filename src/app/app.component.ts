import { ChangeDetectorRef, Component } from '@angular/core';
import { ProgressService } from './shared/providers/progress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  color = 'primary';
  mode = 'indeterminate';
  value = 0;

  constructor(private changeDetector: ChangeDetectorRef, public progressService: ProgressService) {
    progressService.color$.subscribe(color => {
      this.color = color;
      this.changeDetector.detectChanges();
    });
    progressService.mode$.subscribe(mode => {
      this.mode = mode;
      this.changeDetector.detectChanges();
    });
    progressService.value$.subscribe(value => {
      this.value = value;
      this.changeDetector.detectChanges();
    });
  }
}
