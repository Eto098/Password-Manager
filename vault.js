const sqlite3 = require('@journeyapps/sqlcipher').verbose();

function aaa(){
    const dbObject =  new sqlite3.Database(localStorage.getItem("currDb"));
    dbObject.serialize(()=>{
        dbObject.run("PRAGMA cipher_compatibility = 4");
        dbObject.run("PRAGMA key = " + localStorage.getItem("pwd"));
        dbObject.all('SELECT * FROM accounts', function(err, result) {
            if (err) {
                return console.log("Wrong Password");
            }else{
                result.forEach((row) => {
                    console.log(row.label);
                    console.log(row.password);
                    console.log(row.iv);
                })
            }
        });
    });
}
