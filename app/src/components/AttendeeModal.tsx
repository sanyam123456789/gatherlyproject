import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Attendee {
    _id: string;
    username: string;
    email?: string;
}

interface AttendeeModalProps {
    open: boolean;
    onClose: () => void;
    attendees: Attendee[];
    eventTitle: string;
}

export default function AttendeeModal({ open, onClose, attendees, eventTitle }: AttendeeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-arctic-deep border-aurora-cyan/30 max-w-3xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-ice-white font-display text-2xl flex items-center justify-between">
                        <span>Who's Going to {eventTitle}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-ice-gray hover:text-ice-white hover:bg-arctic-mid"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </DialogTitle>
                    <p className="text-ice-gray text-sm font-body">
                        {attendees.length} {attendees.length === 1 ? 'person is' : 'people are'} attending this event
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-aurora-cyan/30 scrollbar-track-arctic-mid">
                    {attendees.map((attendee, idx) => (
                        <motion.div
                            key={attendee._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                            className="relative bg-arctic-mid/50 border border-ice-dark/30 rounded-lg p-4 hover:bg-arctic-mid hover:border-aurora-cyan/50 transition-all duration-200 group"
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan/5 to-aurora-purple/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                            <div className="relative flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-purple flex items-center justify-center text-xl font-bold text-white shadow-lg ring-2 ring-arctic-deep">
                                    {attendee.username.charAt(0).toUpperCase()}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-mono text-ice-white font-semibold text-base truncate">
                                        {attendee.username}
                                    </h4>
                                    {attendee.email && (
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-ice-gray">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{attendee.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional: Add action button */}
                            <div className="relative mt-3 pt-3 border-t border-ice-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-aurora-cyan hover:bg-aurora-cyan/10 text-xs"
                                    onClick={() => {
                                        // Could navigate to profile or open chat
                                        console.log('View profile:', attendee.username);
                                    }}
                                >
                                    View Profile
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {attendees.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-ice-gray font-body">No attendees yet. Be the first to join! 🐧</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
