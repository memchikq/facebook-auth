const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const handlebars = require('express-handlebars');
const dotenv = require('dotenv');
const path = require("path")
const {fileURLToPath } = require("url")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();



app.engine(
    'handlebars',
    handlebars.engine({ defaultLayout: 'main',partialsDir:path.join(__dirname,"views/partials")})
);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'handlebars');



app.use(session({ secret: process.env.secretSession, resave: true, saveUninitialized: true }));




app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: process.env.callbackURL
}, (accessToken, refreshToken, profile, done) => {

  return done(null, profile);
}));





passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});


app.get('/', (req, res) => {
    console.log(req.isAuthenticated())
    res.render('home.handlebars', {
        title: 'Авторизация через Facebook',
    });
});

app.get("/login",(req,res)=>{
  if(req.isAuthenticated()) res.redirect("/profile")
  res.render('login.handlebars');
})

app.get('/logout', (req, res) => {
    req.logout((err)=>{
        if (err) { return next(err); }
    res.redirect('/login');
    })
});


app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/login' }));

app.get('/profile', (req, res) => {
  if(req.isUnauthenticated()) res.redirect("/login")
  const displayName = req.user?.displayName
  const id = req.user?.id
  res.render("profile.handlebars",{
    displayName,
    id,
    auth: req.isAuthenticated()
  })
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');

});