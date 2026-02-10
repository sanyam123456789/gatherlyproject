import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    showPenguin?: boolean;
}

export const AuthLayout = ({ title, description, children, showPenguin = true }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid p-4">
            <Card className="w-full max-w-md bg-arctic-deep/90 backdrop-blur-md shadow-2xl border border-aurora-cyan/30">
                <CardHeader className="text-center">
                    {showPenguin && (
                        <div className="text-6xl mb-4 animate-bounce">🐧</div>
                    )}
                    <CardTitle className="text-3xl font-display font-bold text-ice-white">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-ice-gray font-body">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthLayout;
