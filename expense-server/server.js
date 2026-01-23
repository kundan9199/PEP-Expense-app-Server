// console.log("Hii, I'm your server");

const express = require('express');
const app = express();

app.use(express.json());//Middleware


app.use('/register', (req, res) =>{
    const { name, email, password} = req.body;

    if (!name || !email || !password){
        return res.status(400).json({
            message: 'Name, Email, Password are required'
        })
    }
 


    const newUser ={
        id : UserActivation.length +1,
        name: name,
        eamil: email,
        password: password

    };
    users.push(newUser);
    return res.status(200).json({
        message: 'User Registered',
        user:{ id:newUser.id}
    });
});

app.listen(5001, () =>{
    console.log("Server is running or port 5001");
});