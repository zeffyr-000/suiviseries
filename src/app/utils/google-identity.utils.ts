export const isGoogleLibraryLoaded = (): boolean => {
    // Check if window exists (SSR environments don't have window)
    const win = (globalThis as { window?: Window }).window;
    if (win === undefined) {
        return false;
    }

    return Boolean(win.google?.accounts?.id);
};

export const waitForGoogleLibrary = (timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (isGoogleLibraryLoaded()) {
            resolve();
            return;
        }

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            reject(new Error('Google Identity Services library failed to load'));
        }, timeout);

        const intervalId = setInterval(() => {
            if (isGoogleLibraryLoaded()) {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                resolve();
            }
        }, 100);
    });
};
