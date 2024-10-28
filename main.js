const { app, BrowserWindow, ipcMain, session, Menu } = require("electron");
const path = require("path");
const url = require("url");

// Cria a janela do navegador.
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // Para Electron 12 ou superior, você pode precisar ajustar esta configuração
      allowRunningInsecureContent: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
      icon: path.join(__dirname, "icon.png"),
    },
  });

  // Constrói o caminho para os arquivos estáticos
  // console.log(__dirname);
  const startUrl = url.format({
    pathname: path.join(__dirname, "index.html"), // Ajuste este caminho conforme necessário
    protocol: "file:",
    slashes: true,
  });

  // Carrega o arquivo index.html da aplicação
  win.loadURL(startUrl);
  win.webContents.openDevTools();

  // Abre as DevTools.
  // win.webContents.openDevTools();
  win.once("focus", () => win.flashFrame(false));
  ipcMain.handle("blink-taskbar-notification", (event, activate) => {
    if (activate[1] == "all") {
      win.center();
      win.maximize();
      win.focus();
    }
    return win.flashFrame(activate ? true : false);
  });

  const menuTemplate = [
    {
      label: "Opções",
      submenu: [
        {
          label: "Recarregar",
          click: () => win.reload(),
          accelerator: "CmdOrCtrl+R", // Atalho para recarregar
        },
        {
          label: "Tela Cheia",
          click: () =>
            win.isFullScreen()
              ? win.setFullScreen(false)
              : win.setFullScreen(true),
          accelerator: "F11", // Atalho para alternar o modo tela cheia
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle("set-auth-data", (event, loginData) => {
  // Armazene os dados de login na sessão
  session.defaultSession.authData = loginData;
  return (session.defaultSession.authData = loginData);
});

// No processo principal do Electron (main.js)
ipcMain.handle("get-auth-data", (event) => {
  // Recupere os dados de login da sessão
  return session.defaultSession.authData;
});

app.whenReady().then(createWindow);

// Encerra o app quando todas as janelas são fechadas, exceto no macOS.

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // No macOS é comum recriar uma janela no app quando
  // o ícone no dock é clicado e não há outras janelas abertas.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
