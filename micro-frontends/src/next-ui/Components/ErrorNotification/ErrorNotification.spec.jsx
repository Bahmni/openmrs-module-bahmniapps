import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorNotification from './ErrorNotification';
import { I18nProvider } from '../i18n/I18nProvider';

describe('ErrorNotification Component', () => {
    const mockSetEditError = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with default error message', async () => {
        await act(async () => {
            render(
                <I18nProvider>
                    <ErrorNotification setEditError={mockSetEditError} editErrorMessage={null} />
                </I18nProvider>
            );
        });

        const defaultErrorMessage = /Please enter a value in the mandatory fields or correct the value in the highlighted fields to proceed/i;
        expect(screen.getByText(defaultErrorMessage)).toBeTruthy();
        expect(screen.getByText(/OK/i)).toBeTruthy();
    });

    it('should render the component with a custom error message', async () => {
        const customErrorMessage = 'Custom error message';

        await act(async () => {
            render(
                <I18nProvider>
                    <ErrorNotification setEditError={mockSetEditError} editErrorMessage={customErrorMessage} />
                </I18nProvider>
            );
        });

        expect(screen.getByText(customErrorMessage)).toBeTruthy();
        expect(screen.getByText(/OK/i)).toBeTruthy();
    });

    it('should call setEditError with false when OK button is clicked', async () => {
        await act(async () => {
            render(
                <I18nProvider>
                    <ErrorNotification setEditError={mockSetEditError} editErrorMessage={null} />
                </I18nProvider>
            );
        });

        const okButton = screen.getByText(/OK/i);

        await act(async () => {
            fireEvent.click(okButton);
        });

        expect(mockSetEditError).toHaveBeenCalledTimes(1);
        expect(mockSetEditError).toHaveBeenCalledWith(false);
    });
});
