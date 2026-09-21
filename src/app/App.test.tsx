import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { DataProvider } from './providers/DataProvider';
import { ToastProvider } from '../components/ui/Toast';
import { LoginPage } from '../features/auth/LoginPage';

describe('smoke', () => {
  it('renderiza a entrada do app sem Firebase configurado', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <MemoryRouter>
                <LoginPage />
              </MemoryRouter>
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );
    expect(screen.getByRole('heading', { name: /bem-vindo de volta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explorar demonstração/i })).toBeInTheDocument();
  });
});
