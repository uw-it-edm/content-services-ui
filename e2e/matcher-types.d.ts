declare namespace jasmine {
  interface Matchers<T> {
    toHaveNoViolations(expectationFailOutput?: any): boolean;
  }
}
