var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(
    function(username,password,done){
        User.findOne({username:username},function(err,user){
            //error connecting to db
            if(err){return done(err);}

            //user does not exist
            if(!user){
                return done(null,false,{message:'Incorrect username'});
            }

            //invalid password
            if(!user.validPassword(password)){
                return done(null,false,{message:'Incorrect password'});
            }

            //logged in correctly
            return done(null,user);
        });
    }
));