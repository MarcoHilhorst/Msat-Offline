const xlsx = require('xlsx')
const os = require('os')
const path = require('path')


const { contextBridge } = require('electron');


contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir(),
})

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
})

contextBridge.exposeInMainWorld('xlsx', {
    readFile: (file) => xlsx.readFile(file),
    json: (sheet) => xlsx.utils.sheet_to_json(sheet)
})

