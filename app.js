const express = require('express');
const dotEnv = require('dotenv');
dotEnv.config();
const dbConnect = require('./dbConnect');
const User = require('./user');
const bcrypt = require('bcrypt');
PORT = process.env.PORT || 7658;

const app = express();

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res)=>{
    res.send("It's working");
})

app.post('/register', async(req, res)=>{
    // Accepting user input
    try {
        const {userName, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.create({userName, 'password':hashedPassword});
        if (result)
        return res.status(201).json(result);

        res.status(500).json({message: "Unable to create user"});
    } catch (error) {
        res.status(501).json({message: "Internal server error"})
    }
})

app.post('/login', async(req, res)=>{
    const {userName, password} = req.body;
    const result = await User.findOne({where: {userName}})
    if (!result){
        return res.status(404).json({message: "Invalid credentials"});
    }
    const correctPassword = result.password;
    const isCorrectPassowrd = await bcrypt.compare(password, correctPassword);
    if (!isCorrectPassowrd){
        return res.status(404).json({message: "Invalid credential"});
    }else{
        return res.status(201).json({message: "Login successfully"});
    }
    
});

app.get('/home-page', (req, res)=>{
    res.send("I am the home page");
})


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    dbConnect.authenticate();
});