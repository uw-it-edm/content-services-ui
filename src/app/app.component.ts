import { Component } from '@angular/core';
import { ProgressService } from './shared/providers/progress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(public progressService: ProgressService) {}
}
