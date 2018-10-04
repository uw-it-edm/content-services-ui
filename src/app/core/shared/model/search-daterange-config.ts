export class SearchDaterangeConfig {
  // required
  public filterKey: string;
  public filterLabel: string;
  public placeholder: string;

  // optional
  public active = false;
  public showCalendar = true;
  public showClearButton = true;
  public showDropdowns = false;
  public showRelativeRange = false;
  public displayRangeLabelInsteadOfDates = false;
}
