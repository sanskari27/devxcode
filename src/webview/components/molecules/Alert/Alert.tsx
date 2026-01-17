import { cn } from '@lib/utils';
import { showNotification } from '@src/webview/utils/notifications';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { AlertButton, AlertInput } from './AlertBuilder';

export interface AlertComponentProps {
    title?: string;
    description?: string;
    inputs: AlertInput[];
    buttons: AlertButton[];
    onClose: () => void;
}

export const AlertComponent: React.FC<AlertComponentProps> = ({
    title,
    description,
    inputs,
    buttons,
    onClose,
}) => {
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const backdropRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle ESC key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Focus management - focus first input or dialog on mount
    useEffect(() => {
        if (inputs.length > 0 && dialogRef.current) {
            const firstInput = dialogRef.current.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        } else if (dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [inputs.length]);

    const handleInputChange = (inputId: string, value: string) => {
        setInputValues((prev) => ({
            ...prev,
            [inputId]: value,
        }));
    };

    const handleButtonClick = (button: AlertButton) => {
        // Call all input handlers with current values before button handler
        button.handler(inputValues);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        showNotification('Alert', 'info');
        if (e.target === backdropRef.current) {
            // Only close on backdrop click if no buttons (close icon only mode)
            if (buttons.length === 0) {
                onClose();
            }
        }
    };

    const showCloseIcon = buttons.length === 0;

    return (
        <div
            ref={backdropRef}
            className={cn(
                'fixed inset-0 z-50',
                'flex items-center justify-center',
                'bg-black/50 backdrop-blur-sm',
                'transition-opacity duration-200 opacity-100'
            )}
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? 'alert-title' : undefined}
            aria-describedby={description ? 'alert-description' : undefined}
        >
            <div
                ref={dialogRef}
                className={cn(
                    'relative w-full max-w-md mx-4',
                    'bg-[var(--vscode-editor-background)]',
                    'border border-[var(--vscode-panel-border)]',
                    'rounded-lg shadow-lg',
                    'p-4',
                    'transform transition-all duration-200 scale-100',
                    'focus:outline-none'
                )}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Icon */}
                {showCloseIcon && (
                    <button
                        onClick={onClose}
                        className={cn(
                            'absolute top-4 right-4',
                            'p-1 rounded',
                            'text-[var(--vscode-icon-foreground)]',
                            'hover:bg-[var(--vscode-list-hoverBackground)]',
                            'transition-colors',
                            'flex items-center justify-center',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]'
                        )}
                        aria-label='Close'
                        title='Close (ESC)'
                    >
                        <X className='h-4 w-4' />
                    </button>
                )}

                {/* Title */}
                {title && (
                    <p
                        id='alert-title'
                        className={cn(
                            'text-lg font-semibold',
                            'text-[var(--vscode-foreground)]',
                            showCloseIcon && 'pr-8'
                        )}
                    >
                        {title}
                    </p>
                )}

                {/* Description */}
                {description && (
                    <p
                        id='alert-description'
                        className={cn(
                            'text-sm',
                            'text-[var(--vscode-descriptionForeground)]',
                        )}
                    >
                        {description}
                    </p>
                )}

                <span className='block h-2' />

                {/* Inputs */}
                {inputs.length > 0 && (
                    <div className='space-y-3 mb-4'>
                        {inputs.map((input) => (
                            <input
                                key={input.id}
                                type={input.type}
                                placeholder={input.placeholder}
                                value={inputValues[input.id] || ''}
                                onChange={(e) => handleInputChange(input.id, e.target.value)}
                                className={cn(
                                    'w-full px-3 py-2',
                                    'bg-[var(--vscode-input-background)]',
                                    'border border-[var(--vscode-input-border)]',
                                    'text-[var(--vscode-input-foreground)]',
                                    'rounded',
                                    'focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]',
                                    'placeholder:text-[var(--vscode-input-placeholderForeground)]',
                                    'transition-colors'
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Buttons */}
                {buttons.length > 0 && (
                    <div className='flex gap-2 justify-end mt-4'>
                        {buttons.map((button) => (
                            <button
                                key={button.id}
                                onClick={() => handleButtonClick(button)}
                                className={cn(
                                    'px-4 py-2 rounded',
                                    'font-medium text-sm',
                                    'transition-colors',
                                    'focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]',
                                    button.type === 'primary'
                                        ? [
                                            'bg-[var(--vscode-button-background)]',
                                            'text-[var(--vscode-button-foreground)]',
                                            'hover:bg-[var(--vscode-button-hoverBackground)]',
                                        ]
                                        : [
                                            'bg-[var(--vscode-button-secondaryBackground)]',
                                            'text-[var(--vscode-button-secondaryForeground)]',
                                            'hover:bg-[var(--vscode-button-secondaryHoverBackground)]',
                                        ]
                                )}
                            >
                                {button.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
