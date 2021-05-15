const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const crypto = require('crypto');

const secretKey = 'thsadklfjdsaklnvsdlayasdtalkgsad';

function addDbBtn(){
    addDb(document.getElementById('dbName').value);
}
function addAccountBtn(){
    const newPw = encryptPw(document.getElementById('accountPw').value);
    addAccount(document.getElementById('dbName').value,
        document.getElementById('accountID').value,
        newPw);
}
function getAccountBtn(){
    getAccount(document.getElementById('dbName').value,
        'accounts',
        document.getElementById('accountID').value);
}

function addDb(name){
    console.log(name);
    const db = new sqlite3.Database(name);
    db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = 'mysecret'");
        db.run('CREATE TABLE IF NOT EXISTS accounts(label TEXT, password TEXT, iv TEXT)');
    })
    db.close();
}
function addAccount(currDb, label, password){
    console.log(currDb, label, password);
    const db = new sqlite3.Database(currDb);
    db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = 'mysecret'");
        db.run('INSERT INTO accounts(label, password, iv) VALUES(?,?,?)', [label, password.password, password.iv], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("New employee has been added");
        });
    });
    db.close();
}
function getAccount(currDb, currTable, name){
    console.log(currDb, currTable, name);
    const db = new sqlite3.Database(currDb);
    db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = 'mysecret'");
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
    db.close();
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

//addDb("deneme.sql");

//const newPw1 = encryptPw('password1234');
//addAccount("deneme.sql", "League of Legends", newPw1);

//const newPw2 = encryptPw('sdagsdagsdafsa1234');
//addAccount("deneme.sql", "GMail", newPw2);

//const newPw3 = encryptPw('21423563426457245');
//addAccount("deneme.sql", "Github", newPw3);

//getAccount("deneme.sql", "accounts", "League of Legends");
//getAccount("deneme.sql", "accounts", "Github");
//getAccount("deneme.sql", "accounts", "GMail");


