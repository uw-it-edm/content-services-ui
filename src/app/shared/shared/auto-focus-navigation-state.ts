/**
 * Shared navigation state to request target navigation to set its auto-focus.
 */
export interface AutoFocusNavigationState {
  /**
   * Whether the target of a navigation event should set its auto-focus.
   */
  autoFocusOnNavigate: boolean;
}

/**
 * Navigation state that request target page to set its auto-focus.
 */
export const DefaultAutoFocusNavigationState: AutoFocusNavigationState = {
  autoFocusOnNavigate: true,
};
