const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const crypto = require('crypto');

const secretKey = 'thsadklfjdsaklnvsdlayasdtalkgsad';
let currTable = "Logins";


const db = new sqlite3.Database(localStorage.getItem("currDb"));
db.serialize(()=>{
    db.run("PRAGMA cipher_compatibility = 4");
    db.run("PRAGMA key = " + localStorage.getItem("pwd"));});
setTimeout(function(){ document.getElementById("categories").firstElementChild.classList.add("active") }, 500);
listCategories();
listAccounts();



/**
 * @desc lists all the table names inside the sqlite3 database into the HTML element with id of 'categories'
 * @returns {Promise<void>}
 * @example
 * listCategories()
 */
async function listCategories(){
    await db.serialize(()=>{
        db.each("select name from sqlite_master where type='table'", function (err, table) {
            const categoryElement = document.createElement('a');
            categoryElement.type = "text";
            categoryElement.classList.add("category");
            categoryElement.innerHTML = "<div>"+table.name+"</div>"
            categoryElement.addEventListener('click', function(){
                for(let i = 0; i < document.getElementsByClassName("category").length; i++){
                    document.getElementsByClassName("category")[i].classList.remove("active");
                }
                document.getElementById("accountInfo").innerHTML = "";
                document.getElementById("accountInfoHeader").innerHTML = "";
                document.getElementById("editBtn").innerHTML = "";
                this.classList.add("active");
                currTable = table.name;
                listAccounts();
            });
            document.getElementById("categories").appendChild(categoryElement);
        });
    });
}

/**
 * @desc lists all the tuple's 'label' attributes inside the currTable (variable table name) into the HTML element with id of 'accounts' and refreshes the related HTML element
 * @returns {Promise<void>}
 * @example
 * listAccounts()
 */
async function listAccounts(){
    await db.serialize(()=>{
        db.all('SELECT * FROM ' + currTable, function(err, tuples) {
            if (err) {
                return console.log(err.message);
            }else{
                document.getElementById("accounts").innerHTML = "";
                tuples.forEach((row) => {
                    const accountsElement = document.createElement('a');
                    accountsElement.type = "text";
                    accountsElement.classList.add("account");
                    accountsElement.innerHTML = "<div>"+row.label+"</div>"
                    accountsElement.addEventListener('click', async function(){
                        for(let i = 0; i < document.getElementsByClassName("account").length; i++){
                            document.getElementsByClassName("account")[i].classList.remove("active");
                        }
                        this.classList.add("active");
                        await getAccountInfo(row.label)
                    });
                    document.getElementById("accounts").appendChild(accountsElement);
                })
            }
        });
    });
}

/**
 * @desc puts the information about tuple with the column name given as parameter into the HTML element with id of 'accountInfo'
 * @returns {Promise<void>}
 * @example
 * getAccountInfo(exampleAttribute)
 * @param label
 */
async function getAccountInfo(label){
    await db.serialize(()=>{
        db.all('SELECT * FROM ' + currTable + ' WHERE label = ?', label, function(err, result) {
            if (err) {
                return console.log(err.message);
            }else{
                result.forEach((row) => {
                    document.getElementById("accountInfoHeader").innerHTML = row.label;
                    document.getElementById("editBtn").innerHTML = "<button onclick='editAccount()' type=\"button\" class=\"btn btn-outline-dark btn-sm\" style='border:solid'>~</button>";
                    document.getElementById("accountInfo").innerHTML =
                        "      <label for=\"inputEmail3\" class=\"col-sm-2 col-form-label\">Username</label>\n" +
                        "      <div class=\"col-sm-10\">\n" +
                        "        <input type=\"email\" class=\"form-control\" id=\"inputusername\" value="+row.username+" disabled='disabled'>\n" +
                        "      </div>\n" +
                        "\n" +
                        "      <label for=\"inputPassword3\" class=\"col-sm-2 col-form-label\">Password</label>\n" +
                        "      <div class=\"col-sm-10\">\n" +
                        "        <input type=\"text\" class=\"form-control\" id=\"inputpassword\" value="+decryptPw({iv: row.iv, password: row.password})+" disabled='disabled'>\n" +
                        "      </div>\n" +
                        "\n" +
                        "      <label for=\"inputUrl1\" class=\"col-sm-2 col-form-label\">Website</label>\n" +
                        "      <div class=\"col-sm-10\">\n" +
                        "        <input type=\"text\" class=\"form-control\" id=\"inputwebsite\" value="+row.website+" disabled='disabled'>\n" +
                        "      </div>\n" +
                        "\n" +
                        "      <label for=\"inputUrl2\" class=\"col-sm-2 col-form-label\">Modified</label>\n" +
                        "      <div class=\"col-sm-10\">\n" +
                        "        <input type=\"text\" class=\"form-control\" id=\"inputlastEdited\" value="+row.lastEdited+" disabled='disabled'>\n" +
                        "      </div>\n" +
                        "\n" +
                        "      <label for=\"inputUrl3\" class=\"col-sm-2 col-form-label\">Created</label>\n" +
                        "      <div class=\"col-sm-10\">\n" +
                        "        <input type=\"text\" class=\"form-control\" id=\"inputcreateDate\" value="+row.createDate+" disabled='disabled'>\n" +
                        "      </div>"

                })
            }
        });
    });
}

function addCategoryInput(){
    document.getElementById("addCategoryBtn").disabled =
        !document.getElementById("addTableName").value;
}

/**
 * @desc adds a table with inputted name into sqlite3 database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * addCategory()
 */
async function addCategory(){
    const category = document.getElementById("addTableName").value;
    if(!category) return alert("You Must Enter A Category Name");
    await db.serialize(()=>{
        db.run('CREATE TABLE IF NOT EXISTS ' + category +
            ' (label TEXT NOT NULL, username TEXT, password TEXT NOT NULL, iv TEXT NOT NULL, website TEXT, createDate DATE, lastEdited DATE)');
    });
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("editBtn").innerHTML = "";
    document.getElementById("categories").innerHTML = "";
    document.getElementById("addTableName").value = "";
    document.getElementById("editBtn").value = "";
    await listCategories();
}

function addAccInput(){
    document.getElementById("addAccBtn").disabled =
        !(document.getElementById("recipient-password").value &&
            document.getElementById("recipient-label").value);

}

/**
 * @desc adds a tuple with inputted attributes into currTable (variable table name) database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * addAccount()
 */
async function addAccount(){
    let label = document.getElementById("recipient-label").value === "" ? null : document.getElementById("recipient-label").value;
    if(!label){
        console.log("null");
        return;
    }
    let password = document.getElementById("recipient-password").value === "" ? null : document.getElementById("recipient-password").value;
    if(!password){
        console.log("null");
        return;
    }
    let username = document.getElementById("recipient-username").value === "" ? null : document.getElementById("recipient-username").value;
    let website = document.getElementById("recipient-website").value === "" ? null : document.getElementById("recipient-website").value;
    const encryptedPw = encryptPw(password);
    await db.serialize(()=>{
        db.run('INSERT INTO '+currTable+' VALUES(?,?,?,?,?,date("now"),date("now"))',
            [label, username, encryptedPw.password, encryptedPw.iv, website], function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    });
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("recipient-label").value = "";
    document.getElementById("recipient-username").value = "";
    document.getElementById("recipient-password").value = "";
    document.getElementById("recipient-website").value = "";
    await listAccounts();
    await getAccountInfo(label);
}

/**
 * @desc replaces a tuple's attributes with inputted new ones and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * editAccount()
 */
function editAccount(){
    document.getElementById("inputusername").disabled = false;
    document.getElementById("inputpassword").disabled = false;
    document.getElementById("inputwebsite").disabled = false;
    document.getElementById("btnEdited").style.display = "block";
}

async function btnEdited(){
    let password = document.getElementById("inputpassword").value === "" ? null : document.getElementById("inputpassword").value;
    if(!password) return alert("You Must Enter A Password");
    let username = document.getElementById("inputusername").value === "" ? null : document.getElementById("inputusername").value;
    let website = document.getElementById("inputwebsite").value === "" ? null : document.getElementById("inputwebsite").value;
    const encryptedPw = encryptPw(password);

        db.run('UPDATE '+currTable+
            ' SET website=?, username=?, password=?, iv=?, lastEdited=date("now") WHERE label=?',
            [website, username, encryptedPw.password, encryptedPw.iv,
                document.getElementById("accountInfoHeader").innerText],
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
    });
    let label = document.getElementById("accountInfoHeader").innerText;
    document.getElementById("inputusername").disabled = true;
    document.getElementById("inputpassword").disabled = true;
    document.getElementById("inputwebsite").disabled = true;
    document.getElementById("btnEdited").style.display = "none";
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("editBtn").innerHTML = "";
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
    await db.serialize(()=>{
        db.run('DROP TABLE ' + currTable,
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
    });
    currTable = "";
    await listCategories();
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("editBtn").innerHTML = "";
}

/**
 * @desc deletes a tuple with inputted label attribute from sqlite3 database and refreshes the related HTML elements
 * @returns {Promise<void>}
 * @example
 * deleteAccount()
 */
async function deleteAccount(){
    await db.serialize(()=>{
        db.run('DELETE FROM ' + currTable + ' WHERE label=?',
            document.getElementById("accountInfoHeader").innerText,
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
    });
    document.getElementById("accountInfoHeader").innerHTML = "";
    document.getElementById("accountInfo").innerHTML = "";
    document.getElementById("accounts").innerHTML = "";
    document.getElementById("editBtn").innerHTML = "";
    await listAccounts();

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
