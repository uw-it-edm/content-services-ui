import { Component, Input } from '@angular/core';
import { Field } from '../../../core/shared/model/field';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['./display-field.component.css']
})
export class DisplayFieldComponent {
  @Input() field: Field;
  @Input() value;

  constructor() {}
}
