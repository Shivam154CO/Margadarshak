import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically cleanup after each test to avoid memory leaks or state contamination
afterEach(() => {
  cleanup();
});
