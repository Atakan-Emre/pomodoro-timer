import { state, mutations } from './state.js';

const STORAGE_KEY_STATE = 'pomodoro-state';
const STORAGE_KEY_SESSIONS = 'pomodoro-sessions';

export const storage = {
    saveState: () => {
        const stateToSave = {
            mode: state.mode,
            remainingTime: state.remainingTime,
            pomodoroCount: state.pomodoroCount,
            theme: state.theme
        };
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(stateToSave));
    },

    loadState: () => {
        const savedState = localStorage.getItem(STORAGE_KEY_STATE);
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                // Ensure we don't overwrite with invalid data, but trust the saved data mostly
                // isRunning should always be false on load
                parsedState.isRunning = false;
                mutations.updateState(parsedState);
                return true;
            } catch (e) {
                console.error("Failed to load state", e);
                return false;
            }
        }
        return false;
    },

    saveSession: (session) => {
        // session: { type: 'work', duration: 25, date: ISOString }
        const sessions = storage.loadSessions();
        sessions.push(session);
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    },

    loadSessions: () => {
        const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (savedSessions) {
            try {
                return JSON.parse(savedSessions);
            } catch (e) {
                console.error("Failed to load sessions", e);
                return [];
            }
        }
        return [];
    },

    getTodaySessionsCount: () => {
        const sessions = storage.loadSessions();
        const today = new Date().toDateString();
        return sessions.filter(s =>
            s.type === 'work' &&
            new Date(s.date).toDateString() === today
        ).length;
    },

    getTotalWorkTime: () => {
        const sessions = storage.loadSessions();
        const totalMinutes = sessions
            .filter(s => s.type === 'work')
            .reduce((acc, curr) => acc + curr.duration, 0);
        return totalMinutes;
    }
};
