const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin';


//create the main window
function createMainWindow(){

    //implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu )

    const mainWindow = new BrowserWindow({
        title: 'M-sat Match',
        width:  isDev ? 1000:450,
        height: 700,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
   

    if(isDev){
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create about window
function createAboutWindow (){
    const aboutWindow = new BrowserWindow({
        title: 'About M-sat Match',
        width:  450,
        height: 700,
    })

    
    
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}



app.whenReady()
    .then(() => {

        createMainWindow()

        app.on('activate', () => {
            if(BrowserWindow.getAllWindows().length === 0) {
                createMainWindow()
            }
        })

        
    })

//Menu template
const menu = [ 
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow,
        }]
    }] : [])
]

    //code to properly close the app when when window is closed for non-mac pcs
app.on('window-all-closed', () => {
    if(!isMac){
        app.quit()
    }
})