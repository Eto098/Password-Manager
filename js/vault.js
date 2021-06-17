const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const crypto = require('crypto');

const secretKey = 'thsadklfjdsaklnvsdlayasdtalkgsad';
let currTable = "accounts";

listCategories();
listAccounts();

/**
 * @desc lists all the table names inside the sqlite3 database into the HTML element with id of 'categories'
 * @returns {Promise<void>}
 * @example
 * listCategories()
 */
async function listCategories(){
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.each("select name from sqlite_master where type='table'", function (err, table) {

            const categoryElement = document.createElement('a');
            categoryElement.type = "text";
            categoryElement.innerHTML = "<div class='category'>"+table.name+"</div>"
            categoryElement.addEventListener('click', function(){
                currTable = table.name;
                listAccounts();
            });
            document.getElementById("categories").appendChild(categoryElement);

        });
    });
    await db.close();
}

/**
 * @desc lists all the tuple's 'label' attributes inside the currTable (variable table name) into the HTML element with id of 'accounts' and refreshes the related HTML element
 * @returns {Promise<void>}
 * @example
 * listAccounts()
 */
async function listAccounts(){
    document.getElementById("accounts").innerHTML = "";
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.all('SELECT * FROM ' + currTable, function(err, tuples) {
            if (err) {
                return console.log(err.message);
            }else{
                document.getElementById("accounts").innerHTML = "";
                tuples.forEach((row) => {
                    const accountsElement = document.createElement('a');
                    accountsElement.type = "text";
                    accountsElement.innerHTML = "<div class='account'>"+row.label+"</div>"
                    accountsElement.addEventListener('click', async function(){
                        await getAccountInfo(row.label)
                    });
                    document.getElementById("accounts").appendChild(accountsElement);
                })
            }
        });
    });
    await db.close();
}

/**
 * @desc puts the information about tuple with the column name given as parameter into the HTML element with id of 'accountInfo'
 * @returns {Promise<void>}
 * @example
 * getAccountInfo(exampleAttribute)
 * @param label
 */
async function getAccountInfo(label){
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.all('SELECT * FROM ' + currTable + ' WHERE label = ?', label, function(err, result) {
            if (err) {
                return console.log(err.message);
            }else{
                result.forEach((row) => {
                    document.getElementById("accountInfoHeader").innerText = row.label
                    document.getElementById("accountInfo").innerHTML =
                        "<div class='accountInfo'>" + row.label +
                        "<br>" + decryptPw({iv: row.iv, password: row.password}) +
                        "</div>";
                })
            }
        });
    });
    await db.close();
}

/**
 * @desc adds a table with inputted name into sqlite3 database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * addCategory()
 */
async function addCategory(){
    const category = document.getElementById("addTableName").value;
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('CREATE TABLE IF NOT EXISTS ' + category +
            ' (label TEXT NOT NULL, username TEXT, password TEXT, iv TEXT, createDate DATE, lastEdited DATE)');
    });
    document.getElementById("myModal").style.display = "none";
    await db.close();
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("categories").innerHTML = "";
    await listCategories();
}

/**
 * @desc adds a tuple with inputted attributes into currTable (variable table name) database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * addAccount()
 */
async function addAccount(){
    let label = document.getElementById("addAccName").value;
    let password = document.getElementById("addAccPwd").value;
    let username = document.getElementById("addAccUser").value;
    const encryptedPw = encryptPw(password);
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('INSERT INTO '+currTable+' VALUES(?,?,?,?,date("now"),date("now"))',
            [label, username, encryptedPw.password, encryptedPw.iv], function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    });
    document.getElementById("myModal2").style.display = "none";
    await db.close();
    listAccounts();
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
}

/**
 * @desc replaces a tuple's attributes with inputted new ones and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * editAccount()
 */
async function editAccount(){
    let label = document.getElementById("editAccName").value;
    let password = document.getElementById("editAccPwd").value;
    let username = document.getElementById("editAccUser").value;
    const encryptedPw = encryptPw(password);
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('UPDATE '+currTable+
            ' SET label=?, username=?, password=?, iv=?, lastEdited=date("now") WHERE label=?',
            [label, username, encryptedPw.password, encryptedPw.iv,
                document.getElementById("accountInfoHeader").innerText],
            function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    });
    document.getElementById("myModal3").style.display = "none";
    await db.close();
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    await listAccounts();
    await getAccountInfo(label);
}

/**
 * @desc deletes the table with inputted name from sqlite3 database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * deleteCategory()
 */
async function deleteCategory(){
    document.getElementById("categories").innerHTML = "";
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('DROP TABLE ' + currTable,
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
    });
    currTable = "";
    await db.close();
    await listCategories();
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
}

/**
 * @desc deletes a tuple with inputted label attribute from sqlite3 database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * deleteAccount()
 */
async function deleteAccount(){
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('DELETE FROM ' + currTable + ' WHERE label=?',
            document.getElementById("accountInfoHeader").innerText,
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
    });
    currTable = "";
    await db.close();
    await listAccounts();
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
}

/**
 * @desc encrypts given plain text by using aes-256-ctr algorithm
 * @param password
 * @returns {{password: string, iv: Buffer}}
 * @example
 * encryptPw(plainText)
 */
function encryptPw(password){
    const iv = Buffer.from(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(secretKey), iv);
    const encryptedPw = Buffer.concat([cipher.update(password), cipher.final()]);
    return {iv: iv, password: encryptedPw.toString('hex')};
}

/**
 * @desc decrypts given encrypted password
 * @param encryption
 * @returns {string}
 * @example
 * decryptPw({password: encryptedTex, iv: iv})
 */
function decryptPw(encryption){
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(secretKey), Buffer.from(encryption.iv, 'hex'));
    const decryptedPw = Buffer.concat([decipher.update(Buffer.from(encryption.password, 'hex')), decipher.final()]);
    return decryptedPw.toString();
}



//-----------------MODAL BOXES-----------------//

// Get the modal for addCategory method
const modal = document.getElementById("myModal");
// Get the button that opens the modal
const btn = document.getElementById("addCategoryBtn");
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

// Get the modal for addAccount method
const modal2 = document.getElementById("myModal2");
// Get the button that opens the modal
const btn2 = document.getElementById("addAccountBtn");
// Get the <span> element that closes the modal
const span2 = document.getElementsByClassName("close")[1];
// When the user clicks on the button, open the modal
btn2.onclick = function() {
    modal2.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span2.onclick = function() {
    modal2.style.display = "none";
}

// Get the modal for editAccount method
const modal3 = document.getElementById("myModal3");
// Get the button that opens the modal
const btn3 = document.getElementById("editAccountBtn");
// Get the <span> element that closes the modal
const span3 = document.getElementsByClassName("close")[2];
// When the user clicks on the button, open the modal
btn3.onclick = function() {
    modal3.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span3.onclick = function() {
    modal3.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal2 || event.target === modal || event.target === modal3) {
        modal2.style.display = "none";
        modal.style.display = "none";
        modal3.style.display = "none";
    }
}
