import { ProgressService } from './progress.service';

let progressService: ProgressService;

describe('ProgressService', () => {
  beforeEach(() => {
    progressService = new ProgressService();
  });

  it('should be created', () => {
    expect(progressService).toBeTruthy();
  });

  it('should start with mode indeterminate by default', () => {
    progressService.start();
    expect(progressService.mode).toBe('indeterminate');
    expect(progressService.value).toBe(20);
    expect(progressService.total).toBe(100);
    progressService.progress(30);
    expect(progressService.value).toBe(30);
    progressService.end();
    expect(progressService.value).toBe(0);
  });

  it('should start with mode determinate when specified', () => {
    progressService.start('determinate');
    expect(progressService.mode).toBe('determinate');
    expect(progressService.value).toBe(20);
    expect(progressService.total).toBe(100);
    progressService.increaseSteadily();
    expect(progressService.value).toBe(28);
    progressService.progress(100);
    expect(progressService.value).toBe(0);
  });
});
