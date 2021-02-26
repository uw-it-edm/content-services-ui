import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service that exposes events to change the general state of the application.
 */
@Injectable()
export class ApplicationStateService {
  private warningHeaderMessageSource = new Subject<string>();

  warningHeaderMessageChanged$ = this.warningHeaderMessageSource.asObservable();

  /**
   * Sets the header warning message. See CAB-4228 for details.
   * @param message Message to set in the header (note: HTML will be escaped).
   */
  setWarningHeaderMessage(message: string) {
    this.warningHeaderMessageSource.next(message);
  }
}
