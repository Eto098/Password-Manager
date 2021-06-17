const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const crypto = require('crypto');
//const {dialog} = require('electron').remote;
const {basename} = require('path')

const secretKey = 'thsadklfjdsaklnvsdlayasdtalkgsad';
const saltRounds = 10;

function addDbBtn(){
    addDb(document.getElementById('dbName').value,
            document.getElementById('dbPw').value);
}
function addCategoryBtn(){
    addCategory(document.getElementById('dbNameCategory').value,
                document.getElementById('dbPwCategory').value,
                document.getElementById('categoryID'));
}
function addAccountBtn(){
    const newPw = encryptPw(document.getElementById('accountPw').value);
    addAccount(document.getElementById('dbNameAcc').value,
                document.getElementById('dbPwAcc').value,
                document.getElementById('accountID').value,
                newPw);
}
function getAccountBtn(){
    getAccount(document.getElementById('dbNameGet').value,
                document.getElementById('dbPwGet').value,
                'accounts',
                document.getElementById('accountIDGet').value);
}
function deleteAccountBtn(){
    deleteAccount(document.getElementById('dbNameDelete').value,
                document.getElementById('dbPwDelete').value,
                'accounts',
                document.getElementById('accountIDDelete').value)
}
async function addDb(name, password){
    const db = await new sqlite3.Database(name);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = '" + password + "'");
    })
    await db.close();
}
async function addCategory(currDb, mPassword, category){
    const db = await new sqlite3.Database(currDb);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + mPassword);
        db.run('CREATE TABLE IF NOT EXISTS ? (label TEXT, password TEXT, iv TEXT)', category);
    });
    await db.close();
}
async function addAccount(currDb,mPassword, label, password){
    const db = await new sqlite3.Database(currDb);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + mPassword);
        db.run('INSERT INTO accounts(label, password, iv) VALUES(?,?,?)', [label, password.password, password.iv], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("New employee has been added");
        });
    });
    await db.close();
}
async function getAccount(currDb, mPassword, currTable, name){
    const db = await new sqlite3.Database(currDb);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + mPassword);
        db.all('SELECT * FROM ' + currTable + ' WHERE label = ?', name, function(err, result) {
            if (err) {
                return console.log(err.message);
            }else{
                result.forEach((row) => {
                    console.log(row.label);
                    console.log(row.password);
                    console.log(decryptPw({iv: row.iv, password: row.password}));
                    console.log(row.iv);
                })
            }
        });
    });
    await db.close();
}
async function deleteAccount(currDb, mPassword, currTable, name){
    const db = await new sqlite3.Database(currDb);
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + mPassword);
        db.all('DELETE FROM ' + currTable + ' WHERE label = ?', name, function(err, result) {
            if (err) {
                return console.log(err.message);
            }else{
                console.log("DELETED");
            }
        });
    });
    await db.close();
}

function encryptPw(password){
    const iv = Buffer.from(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(secretKey), iv);
    const encryptedPw = Buffer.concat([cipher.update(password), cipher.final()]);
    return {iv: iv, password: encryptedPw.toString('hex')};
}
function decryptPw(encryption){
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(secretKey), Buffer.from(encryption.iv, 'hex'));
    const decryptedPw = Buffer.concat([decipher.update(Buffer.from(encryption.password, 'hex')), decipher.final()]);
    return decryptedPw.toString();
}
