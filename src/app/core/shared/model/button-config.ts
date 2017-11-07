export class ButtonConfig {
  label: string;
  color: string;
  command: string;
  args: Array<string>;
  type: string;
  alwaysActive = false;

  constructor() {
    this.type = 'button';
  }
}
