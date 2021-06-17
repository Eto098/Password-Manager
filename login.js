const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const {dialog, BrowserWindow} = require('electron').remote;
const {basename} = require('path');
const url = require('url');
const path = require('path');

function browseBtn(){
    dialog.showOpenDialog({title: "Choose A Vault"}).then((result) => {
        localStorage.setItem("currDb", result.filePaths[0]);
        document.getElementById("currDbName").innerText = basename(result.filePaths[0]);
    });
}

async function openVault(){
    const pwd = document.getElementById("masterPassword").value;
    const dbName = localStorage.getItem("currDb");
    localStorage.setItem("pwd", pwd);

    try{
        const dbObject = await new sqlite3.Database(dbName);
        await dbObject.serialize(()=>{
            dbObject.run("PRAGMA cipher_compatibility = 4");
            dbObject.run("PRAGMA key = " + pwd);
            dbObject.all('SELECT * FROM accounts', async function(err) {
                if (err) {
                    return console.log("Wrong Password");
                }else{
                    let window = BrowserWindow.getFocusedWindow();
                    const vaultWindow = new BrowserWindow({
                        width: 1024,
                        height: 720,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,
                            enableRemoteModule: true,
                        },
                    });
                    await vaultWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'vault.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    window.close();
                }
            });
        });
    }catch(e){
        alert("Something is Wrong!");
        console.log(e);
    }
}

async function createVault(){
    const name = localStorage.getItem("addDbName");
    const password = document.getElementById("mPwd").value;
    console.log(name);
    console.log(password);
    await addDb(name, password);
    localStorage.removeItem("addDbName");
    document.getElementById("myModal").style.display = "none";
}

function saveVaultFile(){
    dialog.showSaveDialog({title: "Create A Vault"}).then((result) => {
        localStorage.setItem("addDbName", result.filePath)
    })
}

async function addDb(name, password){
    console.log(name);
    console.log(password);
    const db = await new sqlite3.Database(name);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = '" + password + "'");
        db.run('CREATE TABLE IF NOT EXISTS accounts(label TEXT, username TEXT, password TEXT, iv TEXT, createDate DATE, lasEdited DATE)');
    })
    await db.close();
}
// Get the modal
const modal = document.getElementById("myModal");

// Get the button that opens the modal
const btn = document.getElementById("createVault");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}