export const defaultState = {
    mode: "work", // "work" | "shortBreak" | "longBreak"
    remainingTime: 25 * 60,
    pomodoroCount: 0,
    isRunning: false,
    theme: "dark" // or "light"
};

export const state = { ...defaultState };

export const getters = {
    getMode: () => state.mode,
    getRemainingTime: () => state.remainingTime,
    getPomodoroCount: () => state.pomodoroCount,
    getIsRunning: () => state.isRunning,
    getTheme: () => state.theme
};

export const mutations = {
    setMode: (mode) => { state.mode = mode; },
    setRemainingTime: (time) => { state.remainingTime = time; },
    setPomodoroCount: (count) => { state.pomodoroCount = count; },
    setIsRunning: (isRunning) => { state.isRunning = isRunning; },
    setTheme: (theme) => { state.theme = theme; },
    updateState: (newState) => {
        Object.keys(newState).forEach(key => {
            if (key in state) {
                state[key] = newState[key];
            }
        });
    }
};
