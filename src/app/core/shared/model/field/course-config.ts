// TODO: transform this to an interface, the default values to not work as expected becase the class is not
//      instantiated when the response is received from server.
export class CourseConfig {
  public defaultYear?: string;
  public defaultQuarter?: string;

  get years(): number {
    return this._years;
  }

  set years(value: number) {
    this._years = value;
  }

  get curriculumAbbrevation(): string {
    return this._curriculumAbbrevation;
  }

  set curriculumAbbrevation(value: string) {
    this._curriculumAbbrevation = value;
  }

  private _years = 10;
  private _curriculumAbbrevation = 'PHYS';
}
