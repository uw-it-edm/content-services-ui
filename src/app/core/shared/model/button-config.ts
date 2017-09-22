export class ButtonConfig {
  label: string;
  color: string;
  command: string;
  args: Array<string>;
  type: string;

  constructor() {
    this.type = 'button';
  }
}
