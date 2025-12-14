import { state, mutations, getters } from './state.js';
import { ui } from './ui.js';
import { storage } from './storage.js';

let timerInterval = null;

const MODES = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

// Audio Context Singleton
let audioCtx = null;

const playNotification = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // transform to async/resume pattern if needed, but for now just create/resume
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
};

export const timer = {
    start: () => {
        if (state.isRunning) return;

        // Initialize/Resume audio context on user interaction (Start button)
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

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
        ui.updateCycle(state.pomodoroCount, currentMode); // Update cycle dots
        if (state.remainingTime % 5 === 0) storage.saveState(); // Auto-save every 5 seconds
    },

    complete: () => {
        timer.pause();

        // Play notification sound
        try {
            playNotification();
        } catch (e) {
            console.error("Audio play failed", e);
        }

        // Visual Queue
        const timerDisplay = document.querySelector('.timer-display');
        timerDisplay.classList.add('shake');
        setTimeout(() => timerDisplay.classList.remove('shake'), 2000);

        const completedMode = getters.getMode();
        let nextMode = '';
        let modalTitle = 'Süre Doldu!';
        let modalMessage = '';
        let btnText = '';

        if (completedMode === 'work') {
            const newCount = state.pomodoroCount + 1;
            mutations.setPomodoroCount(newCount);

            storage.saveSession({
                type: 'work',
                duration: MODES.work / 60,
                date: new Date().toISOString()
            });

            // Determine next mode
            if (newCount % 4 === 0) {
                nextMode = 'longBreak';
                modalMessage = 'Harika! 4 Pomodoro tamamladın. Uzun bir molayı hak ettin.';
                btnText = 'Uzun Molayı Başlat';
            } else {
                nextMode = 'shortBreak';
                modalMessage = 'Çalışma bitti. Kısa bir mola verelim mi?';
                btnText = 'Kısa Molayı Başlat';
            }
        } else {
            // Break is over
            nextMode = 'work';
            modalMessage = 'Mola bitti! Yeni bir çalışma oturumuna hazır mısın?';
            btnText = 'Çalışmaya Başla';
        }

        // Update Stats immediately
        ui.updateStats(storage.getTodaySessionsCount(), storage.getTotalWorkTime());
        ui.updateCycle(state.pomodoroCount, completedMode);

        // Show Modal for manual transition
        const modal = ui.getElements().modal;
        const modalStartBtn = ui.getElements().modalStartBtn;

        ui.showModal(modalTitle, modalMessage);
        modalStartBtn.textContent = btnText;

        // One-time listener for the modal action
        modalStartBtn.onclick = () => {
            timer.switchMode(nextMode);
            timer.start();
            ui.hideModal();
        };
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
