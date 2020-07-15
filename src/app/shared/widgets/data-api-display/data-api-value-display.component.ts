import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from '../../providers/notification.service';
import { takeUntil } from 'rxjs/operators';
import { DataApiValueService } from '../../providers/dataapivalue.service';
import { DataApiValue } from '../../shared/model/data-api-value';
import { ObjectUtilities } from '../../../core/util/object-utilities';

const DEFAULT_LABEL_PATH = 'label';

@Component({
  selector: 'app-data-api-display',
  templateUrl: './data-api-value-display.component.html',
  styleUrls: ['./data-api-value-display.component.css'],
})
export class DataApiValueDisplayComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();

  @Input() value: string;
  @Input() type: string;
  @Input() labelPath: string;
  @Input() sourceModel: DataApiValue;

  displayValue: string;
  invalidValueId = false;

  constructor(private dataApiService: DataApiValueService, private notificationService: NotificationService) {}

  ngOnInit() {
    if (this.sourceModel && this.sourceModel.data) {
      this.loadDisplayValueFromSourceModel(this.sourceModel.data);
    } else if (this.value && this.type && this.labelPath) {
      this.dataApiService
        .getByTypeAndValueId(this.type, this.value)
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe(
          (dataApiValue: DataApiValue) => {
            this.displayValue = this.dataApiValueToDisplayValue(dataApiValue);
            this.invalidValueId = false;
          },
          (err) => {
            this.notificationService.warn(err.message, err);
            this.invalidValue();
          }
        );
    } else {
      this.invalidValue();
    }
  }

  private dataApiValueToDisplayValue(value: DataApiValue): string {
    return ObjectUtilities.getNestedObjectFromStringPath(value.data, this.labelPath);
  }

  private invalidValue() {
    console.log('got invalid valueId ' + this.value);
    this.displayValue = this.value;
    this.invalidValueId = true;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  private loadDisplayValueFromSourceModel(sourceModelData: any) {
    const labelPath = this.labelPath || DEFAULT_LABEL_PATH;
    const displayValue = ObjectUtilities.getNestedObjectFromStringPath(sourceModelData, labelPath);

    if (displayValue) {
      this.displayValue = displayValue;
    } else {
      this.invalidValue();
    }
  }
}
