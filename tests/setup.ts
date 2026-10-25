import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import fs from 'fs';

// Automatically load .env.local or .env for tests
if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
} else if (fs.existsSync('.env')) {
  process.loadEnvFile('.env');
}

// Mock next/link to render clean anchor tag in test environments
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { href, ...props }, children);
    },
  };
});
