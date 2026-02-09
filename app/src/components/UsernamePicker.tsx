import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateUsernameOptions } from '@/utils/usernameGenerator';

interface UsernamePickerProps {
    onSelect: (username: string) => void;
    currentUsername?: string;
}

export default function UsernamePicker({ onSelect, currentUsername }: UsernamePickerProps) {
    const [suggestions, setSuggestions] = useState(() => generateUsernameOptions(5));
    const [selected, setSelected] = useState<string | null>(currentUsername || null);

    const regenerate = () => {
        setSuggestions(generateUsernameOptions(5));
        setSelected(null);
    };

    const handleSelect = (username: string) => {
        setSelected(username);
        onSelect(username);
    };

    return (
        <div className="space-y-3 p-4 bg-arctic-mid/30 border border-aurora-cyan/20 rounded-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-display text-ice-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-aurora-cyan" />
                    Suggested Usernames
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerate}
                    className="text-aurora-cyan hover:bg-aurora-cyan/10 h-8 w-8 p-0"
                    type="button"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {suggestions.map((username, idx) => (
                    <motion.button
                        key={username}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        onClick={() => handleSelect(username)}
                        className={`
              px-4 py-2.5 rounded-lg text-left font-mono text-sm
              transition-all duration-200
              ${selected === username
                                ? 'bg-aurora-cyan text-arctic-deepest font-semibold shadow-lg shadow-aurora-cyan/30'
                                : 'bg-arctic-mid/50 text-ice-white hover:bg-arctic-mid border border-ice-dark/30 hover:border-aurora-cyan/50'
                            }
            `}
                    >
                        {username}
                    </motion.button>
                ))}
            </div>

            <p className="text-xs text-ice-gray text-center mt-2">
                Click a username to use it, or type your own below
            </p>
        </div>
    );
}
