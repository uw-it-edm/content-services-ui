import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from '../../providers/notification.service';
import { takeUntil } from 'rxjs/operators';
import { PersonService } from '../../providers/person.service';
import { Person } from '../../shared/model/person';

@Component({
  selector: 'app-person-display',
  templateUrl: './person-display.component.html',
  styleUrls: ['./person-display.component.css']
})
export class PersonDisplayComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();

  @Input() value: string;

  displayName: string;
  invalidRegId: boolean;

  constructor(private personService: PersonService, private notificationService: NotificationService) {}

  ngOnInit() {
    if (this.value) {
      this.personService
        .read(this.value)
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe(
          (person: Person) => {
            this.displayName = Person.convertToDisplayName(person);
            this.invalidRegId = false;
          },
          err => {
            this.notificationService.warn(err.message, err);
            this.invalidPerson();
          }
        );
    } else {
      this.invalidPerson();
    }
  }

  private invalidPerson() {
    this.displayName = this.value;
    this.invalidRegId = true;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
