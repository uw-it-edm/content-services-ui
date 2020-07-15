import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DynamicSelectConfig } from '../../../core/shared/model/field/dynamic-select-config';
import { ListFieldDisplayComponent } from './list-field-display.component';

describe('ListFieldDisplayComponent', () => {
  let component: ListFieldDisplayComponent;
  let fixture: ComponentFixture<ListFieldDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListFieldDisplayComponent],
    }).compileComponents();
  }));

  describe('with static list', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ListFieldDisplayComponent);
      component = fixture.componentInstance;
    });

    it('should display values directly', () => {
      component.values = ['test val 1', 'teset val 2'];
      fixture.detectChanges();

      expect(component.displayValues).toEqual(['test val 1', 'teset val 2']);
    });

    it('should remove empty values', () => {
      component.values = [null, 'test val 1', ''];
      fixture.detectChanges();

      expect(component.displayValues).toEqual(['test val 1']);
    });

    it('should limit display values if there are more than 3 items to display', () => {
      component.values = ['val 1', '', 'val 2', 'val 3', 'val 4'];
      fixture.detectChanges();

      expect(component.displayValues).toEqual(['val 1', 'val 2', 'val 3']);
    });

    it('should not render information text if there are 3 or less items to display', () => {
      component.values = ['val 1', 'val 2', 'val 3'];
      fixture.detectChanges();

      const moreItemsElement = fixture.debugElement.query(By.css('.more-items'));
      expect(moreItemsElement).toBeNull();
    });

    it('should render information text if there are more than 3 items to display', () => {
      component.values = ['val 1', 'val 2', 'val 3', 'val 4', 'val 5'];
      fixture.detectChanges();

      const moreItemsElement = fixture.debugElement.query(By.css('.more-items'));
      expect(moreItemsElement).not.toBeNull();
      expect(moreItemsElement.nativeElement.textContent).toEqual('... 2 more');
    });
  });

  describe('with data-api backed list', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ListFieldDisplayComponent);
      component = fixture.componentInstance;
      component.selectConfig = new DynamicSelectConfig();
    });

    it('should display items from source model', () => {
      component.values = ['val1', 'val2'];
      component.sourceModel = [
        { valueId: 'val1', data: { label: 'value 1' } },
        { valueId: 'val2', data: { label: 'value 2' } },
      ];
      fixture.detectChanges();

      expect(component.displayValues).toEqual(['value 1', 'value 2']);
    });

    it('should use the label path to get item text', () => {
      component.selectConfig.labelPath = 'key.path';
      component.values = ['val1'];
      component.sourceModel = [
        {
          valueId: 'val1',
          data: {
            key: {
              path: 'value 1',
            },
          },
        },
      ];
      fixture.detectChanges();

      expect(component.displayValues).toEqual(['value 1']);
    });

    it('should limit display values and show information text if there are more than 3 items to display', () => {
      component.values = ['val1', 'val2', 'val3', 'val4'];
      component.sourceModel = [
        { valueId: 'val1', data: { label: 'value 1' } },
        { valueId: 'val2', data: { label: 'value 2' } },
        { valueId: 'val3', data: { label: 'value 3' } },
      ];
      fixture.detectChanges();

      const moreItemsElement = fixture.debugElement.query(By.css('.more-items'));

      expect(component.displayValues).toEqual(['value 1', 'value 2', 'value 3']);
      expect(moreItemsElement).not.toBeNull();
      expect(moreItemsElement.nativeElement.textContent).toEqual('... 1 more');
    });

    it('should add invalid item if source model is missing', () => {
      component.values = ['val1', 'val2'];
      component.sourceModel = null;
      fixture.detectChanges();

      const invalidItems = fixture.debugElement.queryAll(By.css('.item-invalid'));

      expect(component.displayValues).toEqual([null, null]);
      expect(invalidItems.length).toEqual(2);
      expect(invalidItems[0].nativeElement.textContent).toEqual('Invalid value');
    });

    it('should add invalid item if source model is missing properties', () => {
      component.values = ['val1', 'val2'];
      component.sourceModel = [{ valueId: 'val1', data: { otherLabel: 'value 1' } }];
      fixture.detectChanges();

      const invalidItems = fixture.debugElement.queryAll(By.css('.item-invalid'));

      // One of the values is missing from the source model, the other is there but the label path is wrong.
      expect(invalidItems.length).toEqual(2);
      expect(invalidItems[0].nativeElement.textContent).toEqual('Invalid value');
    });

    it('should throw error if source model is not an array', () => {
      component.values = ['val1'];
      component.sourceModel = <any>{ valueId: 'val1', data: { label: 'value 1' } };

      expect(() => fixture.detectChanges()).toThrowError('Input sourceModel should be an array. Current type: object');
    });
  });
});
