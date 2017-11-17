export class Student {
  public birthdate?;
  public displayName: string;
  public email?: string;
  public firstName: string;
  public lastName: string;
  public netId: string;
  public studentNumber: string;
  public studentSystemKey: string;

  static convertToDisplayName(student: Student) {
    return student.lastName + ', ' + student.firstName + ' (' + student.studentNumber + ')';
  }
}
