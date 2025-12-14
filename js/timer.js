import { state, mutations, getters } from './state.js';
import { ui } from './ui.js';
import { storage } from './storage.js';

let timerInterval = null;

const MODES = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

export const timer = {
    start: () => {
        if (state.isRunning) return;

        mutations.setIsRunning(true);
        ui.updateStartPauseButton(true);

        timerInterval = setInterval(() => {
            if (state.remainingTime > 0) {
                mutations.setRemainingTime(state.remainingTime - 1);
                timer.tick();
            } else {
                timer.complete();
            }
        }, 1000);
    },

    pause: () => {
        if (!state.isRunning) return;

        mutations.setIsRunning(false);
        ui.updateStartPauseButton(false);
        clearInterval(timerInterval);
        storage.saveState(); // Save state on pause
    },

    reset: () => {
        timer.pause();
        const currentMode = getters.getMode();
        mutations.setRemainingTime(MODES[currentMode]);
        timer.tick();
        storage.saveState();
    },

    tick: () => {
        const currentMode = getters.getMode();
        const totalTime = MODES[currentMode];
        ui.updateTimerDisplay(state.remainingTime);
        ui.updateProgressRing(state.remainingTime, totalTime);
        if (state.remainingTime % 5 === 0) storage.saveState(); // Auto-save every 5 seconds
    },

    complete: () => {
        timer.pause();

        // Play notification sound (Base64 Beep)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500);

        // Visual Queue
        const timerDisplay = document.querySelector('.timer-display');
        timerDisplay.classList.add('shake');
        setTimeout(() => timerDisplay.classList.remove('shake'), 2000);

        const completedMode = getters.getMode();

        if (completedMode === 'work') {
            const newCount = state.pomodoroCount + 1;
            mutations.setPomodoroCount(newCount);

            storage.saveSession({
                type: 'work',
                duration: MODES.work / 60,
                date: new Date().toISOString()
            });

            // Auto switch mode
            if (newCount % 4 === 0) {
                timer.switchMode('longBreak');
            } else {
                timer.switchMode('shortBreak');
            }
        } else {
            timer.switchMode('work');
        }

        // Update Stats
        ui.updateStats(storage.getTodaySessionsCount(), storage.getTotalWorkTime());

        alert("Süre Doldu!"); // Simple alert for now
    },

    switchMode: (mode) => {
        mutations.setMode(mode);
        mutations.setRemainingTime(MODES[mode]);
        ui.updateModeButtons(mode);
        ui.updateTimerDisplay(state.remainingTime);
        ui.updateProgressRing(state.remainingTime, MODES[mode]);

        // Ensure background color changes or some visual indication could be added here in UI
        storage.saveState();
    }
};
