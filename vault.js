const sqlite3 = require('@journeyapps/sqlcipher').verbose();
let currTable = "accounts";
listCategories();

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
async function listAccounts(){
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.all('SELECT * FROM ' + currTable, function(err, tuples) {
            if (err) {
                return console.log(err.message);
            }else{
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
                        "<br>" + row.password +
                        "</div>";
                })
            }
        });
    });
    await db.close();
}
async function addCategory(){
    const category = document.getElementById("addTableName").value;
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('CREATE TABLE IF NOT EXISTS ' + category + ' (label TEXT, username TEXT, password TEXT, iv TEXT, createDate DATE, lasEdited DATE)');
    });
    document.getElementById("myModal").style.display = "none";
    await db.close();
}
async function addAccount(){
    label = document.getElementById("addAccName").value;
    password = document.getElementById("addAccPwd").value;
    iv = "sdgsdaghsda";
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('INSERT INTO '+currTable+' (label, password) VALUES(?,?)', [label, password], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("New employee has been added");
        });
    });
    document.getElementById("myModal2").style.display = "none";
    await db.close();
}
async function editAccount(){
    label = document.getElementById("editAccName").value;
    password = document.getElementById("editAccPwd").value;
    console.log(label);
    console.log(password);
    console.log(document.getElementById("accountInfoHeader").innerText);
    const db = await new sqlite3.Database(localStorage.getItem("currDb"));
    await db.serialize(()=>{
        db.run("PRAGMA cipher_compatibility = 4");
        db.run("PRAGMA key = " + localStorage.getItem("pwd"));
        db.run('UPDATE '+currTable+' SET label=?, password=? WHERE label=?',
            [label, password, document.getElementById("accountInfoHeader").innerText],
            function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Employee has been update");
        });
    });
    document.getElementById("myModal3").style.display = "none";
    await db.close();
}
// Get the modal
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

// Get the modal
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

// Get the modal
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
