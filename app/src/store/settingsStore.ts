import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    penguinEnabled: boolean;
    setPenguinEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            penguinEnabled: true,
            setPenguinEnabled: (value) => set({ penguinEnabled: value }),
        }),
        {
            name: 'gatherly-settings-storage',
        }
    )
);

export default useSettingsStore;
