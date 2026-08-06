const {MongoClient} = require("mongodb");
const {DB_URI, DATABASE, COLLECTION} = require("./env")
const mongoClient = new MongoClient(DB_URI);
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);
const mongooseDb = require('./config/database')
// const crypto = require('crypto')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secretKey = 'secret';

// var router = express.Router();

const jsonParser = bodyParser.json()

mongooseDb.connect();
const User = require("./models/User");

const database = mongoClient.db(DATABASE);
const data = database.collection(COLLECTION);

// const checkPass = async (user, password)=> {
//
//     console.log('checkPass user:', user)
//     console.log('checkPass password:', password)
//
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     console.log('passwordMatch', passwordMatch)
//
//     // return crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//     //     if (err) { console.log('err', err); }
//     //     const userPassArrayBuffer = new ArrayBuffer(user.password);
//     //     const hashedPasswordArrayBuffer = new ArrayBuffer(hashedPassword)
//     //     if (!crypto.timingSafeEqual(userPassArrayBuffer, hashedPasswordArrayBuffer)) {
//     //         return console.log('Incorrect username or password.');
//     //     }
//     //     // const token = jwt.sign({ userId: user._id }, '', {
//     //     //     expiresIn: '1h',
//     //     // });
//     //     return console.log('user - OK!')
//     // });
// }

async function run() {
    try {
        return await data.find().toArray();
    }
    catch (err) {
        console.log('DB error', err)
    }
    // finally {
    //     await mongoClient.close();
    // }
}

async function find(username) {
    try {
        return await data.findOne({username});
    }
    catch (err) {
        console.log('DB error', err)
    }
    // finally {
    //     await mongoClient.close();
    // }
}

app.get('/create', async (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    // const data = await run();
    // const json = JSON.stringify(data);
    // res.send(json)
    const user = await User.create({
        first_name: '123',
        last_name: '321',
    });
    res.send('test send')
});
app.get('/login', function(req, res, next) {
    res.render('login');
});
app.get('/data', async function(req, res, next) {
    const data = await run()
    res.send(data);
});

// CreatUser
app.post('/signup', jsonParser, async function(req, res, next) {

    const {username, password} = req.body
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // const salt = crypto.randomBytes(16);

    console.log('create user')
    console.log('username', username)
    console.log('password', password);

    await User.create({
        username: req.body.username,
        password: hashedPassword,
    });


    ///const hashedPassword = await bcrypt.hash(password, 10);

    // crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    //     if (err) { return next(err); }
    //
    //     // const user = User.create({
    //     //     first_name: '123',
    //     //     last_name: '321',
    //     // });
    //
    //     // console.log('username', req.body.username)
    //     // console.log('password', req.body.password);
    //     // console.log('hashedPassword',hashedPassword);
    //     // console.log('salt', salt)
    //     //
    //     // User.create({
    //     //     username: req.body.username,
    //     //     password: hashedPassword,
    //     //     salt: salt
    //     // });
    //     //
    //     // return res.sendStatus(200);
    //
    //
    //     // db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    //     //     req.body.username,
    //     //     hashedPassword,
    //     //     salt
    //     // ],
    //
    //     // function(err) {
    //     //     if (err) { return next(err); }
    //     //     var user = {
    //     //         id: this.lastID,
    //     //         username: req.body.username
    //     //     };
    //     //     req.login(user, function(err) {
    //     //         if (err) { return next(err); }
    //     //         res.redirect('/');
    //     //     });
    //     // });
    // });

    return res.sendStatus(200);
});

// AuthUser
app.post('/user', jsonParser,
    async function (req, res, next) {
        const {username, password} = req.body
        console.log('create user')
        console.log('username', username)
        console.log('password', password);

        // const userName = req.body.username;
        // const passWord = req.body.password;
        //console.log('request', userName, '  pass', passWord);

        const user = await find(username)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log('isPasswordValid', isPasswordValid)
        const token = jwt.sign({userId: user._id}, secretKey, {
            expiresIn: '10m',
        });

        console.log('token', token)

        // await checkPass(user, passWord) //12233
        const data = {userToken: token}
        res.send(data)
    });

app.post('/check-token', jsonParser, async (req, res, next) => {

    const list = await io.sockets.sockets;

    console.log('list', list)

    try {
            const {userToken} = req.body;
            jwt.verify(userToken, secretKey, function(err, decoded) {
                if(err) {

                    return res.status(401).send({err})
                }
                console.log('decoded', decoded) // bar
                return res.sendStatus(200);
            });
        } catch (err) {
            console.log(err);
            return res.sendStatus(500)
        }

    });

const port = process.env.PORT || 8080;

io.engine.use(async (req, res, next) => {
    console.log('check')
    try {
        const token = req.headers.authorization
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                console.log('websocket invalid token')
                return next(new Error("invalid token"));
            }
            next();
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
});

io.on('connection', (socket) => {
    let count = 0
    console.log('a user connected', socket.id);
    // setInterval(()=> {
    //     count ++
    //     console.log('count', count)
    //     if(count === 10) {
    //         socket.disconnect(true);
    //     }
    // }, 1000)
    socket.on('close', (msg)=>{
        console.log(socket.id)
        socket.disconnect();
    });
    socket.on('msg', (msg)=>console.log('socketIO message:', msg))
    socket.on('root', (msg)=>console.log('socketIO message:', msg))
    socket.on('disconnect', ()=>console.log('disconnect'))
    socket.on('disconnecting', ()=>console.log('disconnecting'))
});

io.on('disconnect', (socket) => {
    console.log('a user connected');
});

// io.on('message', (msg)=>console.log('socketIO message:', msg))
// io.on('msg', (msg)=>console.log('socketIO message:', msg))
// io.on('root', (msg)=>console.log('socketIO message:', msg))


httpServer.listen(port, () => {
    console.log(`Listening port: ${port}`);
});
