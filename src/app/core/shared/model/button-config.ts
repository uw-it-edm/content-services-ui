export class ButtonConfig {
  label: string;
  color: string;
  command: string;
  icon: string;
  args: Array<string>;
  type: string;
  alwaysActive = false;

  constructor() {
    this.type = 'button';
  }
}
