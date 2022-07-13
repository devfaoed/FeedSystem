var express = require('express');
var bodyParser = require('body-parser')
var ejs = require('ejs')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var passport = require("passport");
var LocalStrategy = require("passport-local");

app.set("view engine", "ejs")
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

const { serializeUser } = require("passport");

// mongoose.connect("mongodb://localhost/feedSystem", {useNewUrlParser: true, useUnifiedTopology: true})

 //online connection
 const url = "mongodb+srv://adedokun:adedokun@cluster0.inbfm.mongodb.net/feedSystem?retryWrites=true&w=majority";
 mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
 

const port = process.env.PORT || 3000

io.on('connection', () =>{
  console.log('a user is connected')
})

//databse importation
var Message = require("./model/feed")
var User = require("./model/user")


// configuring passport
app.use(require("express-session")({
  secret: "building an article blog app",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use( new LocalStrategy(User.authenticate()));

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});





app.get("/",  (req, res) => {
    res.redirect("/login")
})

app.get('/messages', (req, res) => {
  Message.find({}).populate("user").exec((err, message)=> {
    if(err){
      console.log(err)
    }
    else{
      res.render("message", {message:message});
    }
  })
  })


// app.get('/messages/:user', (req, res) => {
//   var user = req.params.user
//   Message.find({name: user},(err, messages)=> {
//     res.send(messages);
//   })
// })


// routes to add comments to post
// routes.post("/blog/:id/show", isLoggedIn,  function(req, res){
//   Blog.findById(req.params.id, function(err, foundblog){
//      if(err){
//          console.log(err);
//      }
//      else{
//          Comment.create(req.body.comment, function(err, comment){
//              if(err){
//                  console.log(err);
//              }
//              else{
//                  comment.author.id = req.user._id
//                  comment.author.username = req.user.username;
//                  comment.save();
//                  foundblog.comments.push(comment);
//                  foundblog.save();
//                  console.log(req.body.comment);
//                  res.redirect("/blog/" + foundblog._id + "/show");
//              }
//          })
//      }
//  })
// })

app.post('/messages', (req, res) => {
    let Formfeed =  ({
        name: req.body.name,
        message : req.body.message
      })
      Message.create(Formfeed, (err, messages) => {
        if(err){
          console.log(err)
        }
        else{
          console.log(messages)
          res.redirect("/messages")
        }
       })
    })

// app.post('/messages', async (req, res) => {
//   try{
//     var message = new Message(req.body);

//     var savedMessage = await message.save()
//       console.log('saved');

//     var censored = await Message.findOne({message:'badword'});
//       if(censored)
//         await Message.remove({_id: censored.id})
//       else
//         io.emit('message', req.body);
//       res.sendStatus(200);
//   }
//   catch (error){
//     res.sendStatus(500);
//     return console.log('error',error);
//   }
//   finally{
//     console.log('Message Posted')
//   }

// })

// routes to register form
app.get("/register", function(req, res){
  res.render("register")
})

// routes to create account
app.post("/register", function(req, res){
  const newUser =  new User (
      {  
      username: req.body.username,    
  })
  User.register(newUser, req.body.password, function(err, register){
      if(err){
          console.log(err);
          res.redirect("back");
      }
      else{
          passport.authenticate("local")(req, res, function(){
          res.redirect("/messages");
          console.log("user registered succeessfully")
          })
      }
  })
})

// routes to login form
app.get("/login", function(req, res){
  res.render("login");
})

//routes to login 
app.post("/login", passport.authenticate("local", 
{
  successRedirect: "/messages",
  failureRedirect: "/login"
}), function(req, res){ 

})


//routes to logout
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
