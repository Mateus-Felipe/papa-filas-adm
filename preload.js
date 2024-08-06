const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    setLoginAuth: (name) => ipcRenderer.invoke('set-auth-data', name),
    getLoginAuth: (cookieDetails) => ipcRenderer.invoke('get-auth-data', cookieDetails),
    blinkTaskbar: (activate) => ipcRenderer.invoke('blink-taskbar-notification', activate),
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        ipcRenderer.send(channel, args);
    }
});