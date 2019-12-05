export class CourseConfig {
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
