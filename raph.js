let obj = [
    {
        id : 1,
        username: 'sahil ansari',
        password: "12345"
    },
    {
        id : 2,
        username: 'Allu ansari',
        password: "57656"
    },
    {
        id : 3,
        username: 'sahil ansari',
        password: "98483"
    }
]

let update = {
    id : 2 ,
    username : "Hamidul"

}

let id = update.id;

let findIndex = obj.findIndex((c)=> c.id === id)

let updatedObj = {...obj[findIndex], ...update}
console.log(updatedObj)

console.log(obj)

obj[findIndex] = updatedObj

console.log(obj)
