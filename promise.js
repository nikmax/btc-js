function getChildren(){
    return new Promise ((resolve,reject) => {
        //setTimeout(() => {
            if(true){
                resolve([
                    { name: "Nikita", age: 2002},
                    { name: "Maxim", age: 2005},
                    { name: "Andrej", age: 2009},
                    { name: "Valentina", age: 2012}
                ]);
            }else{
                reject('Fehler!');
            }
        //}, 2000);
    });
}
/*
getChildren()
.then((x) => {
    console.log(x)
})
.catch()
.finally(() => { console.log("fertig")});
*/