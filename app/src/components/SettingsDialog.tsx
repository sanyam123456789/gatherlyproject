import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

const SettingsDialog = () => {
    const { penguinEnabled, setPenguinEnabled } = useSettingsStore();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your Gatherly experience
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="penguin-toggle" className="text-base">
                                🐧 Penguin Companion
                            </Label>
                            <p className="text-sm text-gray-500">
                                Show cute penguin that follows your cursor
                            </p>
                        </div>
                        <Switch
                            id="penguin-toggle"
                            checked={penguinEnabled}
                            onCheckedChange={setPenguinEnabled}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
