// Cache for audio objects to avoid reloading
const audioCache = {};

// Track active audio instances
let activeAudioInstances = [];

export const playGlobalAlert = (volume = 1.0, type = 'work') => {
    try {
    let soundFile;
    switch (type) {
    case 'break':
    case 'longBreak':
    soundFile = 'sounds/break-complete.mp3';
    break;
    case 'tick':
    soundFile = 'sounds/tick.mp3';
    break;
    case 'work':
    default:
    soundFile = 'sounds/work-complete.mp3';
    break;
    }

    const audio = new Audio('./' + soundFile);
    audio.volume = Math.min(Math.max(volume, 0), 1);

    // Add to active instances
    activeAudioInstances.push(audio);

    // Remove from active instances when ended
    audio.addEventListener('ended', () => {
    const index = activeAudioInstances.indexOf(audio);
    if (index > -1) {
    activeAudioInstances.splice(index, 1);
    }
    });

    // Play and handle errors
    const playPromise = audio.play();
    if (playPromise !== undefined) {
    playPromise.catch(error => {
    console.error("Audio playback failed:", error);
    // Remove from active instances on error
    const index = activeAudioInstances.indexOf(audio);
    if (index > -1) {
    activeAudioInstances.splice(index, 1);
    }
    });
    }

    return audio;
    } catch (e) {
    console.error("Failed to play global alert:", e);
    return null;
    }
};

// Stop all active audio instances
export const stopAllGlobalAlerts = () => {
    activeAudioInstances.forEach(audio => {
    try {
    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
    audio.load();
    } catch (error) {
    console.error('Error stopping audio:', error);
    }
    });
    activeAudioInstances = [];
};

// Make it available globally for cleanup
if (typeof window !== 'undefined') {
    window.stopAllGlobalAlerts = stopAllGlobalAlerts;
}
