import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-light to-cyan-light p-4">
                    <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
                        {/* Penguin illustration */}
                        <div className="mb-6 flex justify-center">
                            <svg width="80" height="80" viewBox="0 0 50 50" className="drop-shadow-lg">
                                {/* Penguin body */}
                                <ellipse cx="25" cy="30" rx="15" ry="18" fill="#2C2C2C" />
                                <ellipse cx="25" cy="30" rx="10" ry="14" fill="#FFFFFF" />
                                {/* Penguin head */}
                                <circle cx="25" cy="15" r="10" fill="#2C2C2C" />
                                {/* Sad eyes */}
                                <circle cx="22" cy="14" r="2" fill="#FFFFFF" />
                                <circle cx="28" cy="14" r="2" fill="#FFFFFF" />
                                <ellipse cx="22" cy="15" rx="1" ry="1.5" fill="#000000" />
                                <ellipse cx="28" cy="15" rx="1" ry="1.5" fill="#000000" />
                                {/* Beak */}
                                <polygon points="25,17 23,19 27,19" fill="#FFA500" />
                                {/* Wings */}
                                <ellipse cx="13" cy="28" rx="5" ry="10" fill="#2C2C2C" transform="rotate(-20 13 28)" />
                                <ellipse cx="37" cy="28" rx="5" ry="10" fill="#2C2C2C" transform="rotate(20 37 28)" />
                                {/* Feet */}
                                <ellipse cx="20" cy="46" rx="4" ry="2" fill="#FFA500" />
                                <ellipse cx="30" cy="46" rx="4" ry="2" fill="#FFA500" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                            🐧 Oops! Something went wrong
                        </h1>

                        <p className="text-gray-600 mb-2">
                            Our penguin is investigating the issue...
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-700">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-dark hover:opacity-90"
                            >
                                Refresh Page
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/events'}
                                className="w-full"
                            >
                                Go to Events
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">
                            If this keeps happening, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
