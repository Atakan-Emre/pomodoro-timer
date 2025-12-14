import { state, getters, mutations } from './state.js';
import { timer } from './timer.js';
import { ui } from './ui.js';
import { storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    ui.init();

    // Load State
    if (storage.loadState()) {
        ui.updateModeButtons(state.mode);
        ui.updateTheme(state.theme);
        // Timer display will be updated by tick logic below or manual update
        ui.updateTimerDisplay(state.remainingTime);

        // Recalculate progress based on mode total time
        const MODES = {
            work: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60
        };
        ui.updateProgressRing(state.remainingTime, MODES[state.mode]);
    } else {
        // Initial defaults
        ui.updateTimerDisplay(state.remainingTime);
        ui.updateTheme(state.theme);
    }

    // Load Stats
    ui.updateStats(storage.getTodaySessionsCount(), storage.getTotalWorkTime());

    // Event Listeners
    const elements = ui.getElements();

    elements.startPauseBtn.addEventListener('click', () => {
        if (getters.getIsRunning()) {
            timer.pause();
        } else {
            timer.start();
        }
    });

    elements.resetBtn.addEventListener('click', () => {
        timer.reset();
    });

    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            timer.switchMode(mode);
        });
    });

    elements.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = getters.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        mutations.setTheme(newTheme);
        ui.updateTheme(newTheme);
        storage.saveState();
    });
});
