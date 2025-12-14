import { getters } from './state.js';

const elements = {
    timerDisplay: document.querySelector('.time-text'),
    progressRingCircle: document.querySelector('.progress-ring__circle'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    startPauseBtn: document.getElementById('start-pause-btn'),
    resetBtn: document.getElementById('reset-btn'),
    themeToggleBtn: document.getElementById('theme-toggle'),
    todayCount: document.getElementById('today-count'),
    totalTime: document.getElementById('total-time'),
    html: document.documentElement
};

const CIRCLE_RADIUS = 140;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const ui = {
    init: () => {
        elements.progressRingCircle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
        elements.progressRingCircle.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
    },

    updateTimerDisplay: (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        elements.timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        // Update document title
        document.title = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} - Pomodoro`;
    },

    updateProgressRing: (remainingTime, totalTime) => {
        const offset = CIRCLE_CIRCUMFERENCE - (remainingTime / totalTime) * CIRCLE_CIRCUMFERENCE;
        elements.progressRingCircle.style.strokeDashoffset = offset;
    },

    updateModeButtons: (activeMode) => {
        elements.modeButtons.forEach(btn => {
            if (btn.dataset.mode === activeMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    updateStartPauseButton: (isRunning) => {
        elements.startPauseBtn.textContent = isRunning ? 'Duraklat' : 'Başlat';
        elements.startPauseBtn.classList.toggle('active', isRunning);
    },

    updateTheme: (theme) => {
        elements.html.dataset.theme = theme;
        const iconSpan = elements.themeToggleBtn.querySelector('.icon');
        iconSpan.textContent = theme === 'dark' ? '🌙' : '☀️';
    },

    updateStats: (todayCount, totalMinutes) => {
        elements.todayCount.textContent = todayCount;

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        let timeString = `${m}dk`;
        if (h > 0) timeString = `${h}sa ${m}dk`;

        elements.totalTime.textContent = timeString;
    },

    getElements: () => elements
};
