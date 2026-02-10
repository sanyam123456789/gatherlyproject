import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeDialogProps {
    username: string;
    displayName: string;
    open: boolean;
    onClose: () => void;
}

export const WelcomeDialog = ({ username, displayName, open, onClose }: WelcomeDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-arctic-deep border-aurora-cyan/30 text-ice-white">
                <DialogHeader>
                    <div className="text-8xl mb-4 text-center animate-bounce">🐧</div>
                    <DialogTitle className="text-2xl text-ice-white text-center font-display">
                        Welcome to Gatherly, {displayName}!
                    </DialogTitle>
                    <DialogDescription className="text-ice-gray text-center font-body">
                        Your account is ready. Let's find some amazing events! ✨
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-ice-gray text-sm font-body py-4">
                    <p className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        Account created successfully
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-lg">🆔</span>
                        Username: <span className="text-aurora-cyan font-mono">{username}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-lg">🎫</span>
                        Ready to join events
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-lg">📸</span>
                        Ready to share Afterglows
                    </p>
                </div>

                <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50 text-white font-semibold"
                >
                    Explore Events →
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomeDialog;
