const express = require('express');
const dotEnv = require('dotenv');
dotEnv.config();
const dbConnect = require('./dbConnect');
const User = require('./user');
const bcrypt = require('bcrypt');
const expressSession = require('express-session');
PORT = process.env.PORT || 7658;
const APP_SECRET = process.env.APP_SECRET;

const app = express();
app.use(expressSession({
    secret: APP_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

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
        return res.status(404).json({message: "Invalid credentials"});
    }else{
        req.session.user = result.id;
        return res.status(201).json({message: "Login successfully"});
    }
    
});

const isUserAuthenticated = (req, res, next)=>{
    if (req.session.user){
        return next();
    }
    res.status(401).json({message: "Kindly login to proceed"});
}

app.get('/home-page', isUserAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.user;
        const userInfo = await User.findOne({where: {id:userId}});
        res.send(`Welcome ${userInfo.userName}`)
    } catch (error) {
        res.send('Unable to handle request')
    }
    
})


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    dbConnect.authenticate();
});