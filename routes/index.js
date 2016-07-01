var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

//Middleware for authenticating jwt
var auth = jwt({secret:'SECRET',userProperty:'payload'});


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

// GET/posts  to get all the Posts
router.get('/posts', function (req, res, next) {
    Post.find(function (err, posts) {
        if (err) {
            return next(err);
        }
        res.json(posts);
    });
});

// POST/posts to post a new post
router.post('/posts',auth, function (req, res, next) {
    var post = new Post(req.body);
    post.author=req.payload.username;
    
    post.save(function (err, post) {
        if (err) {
            return next(err);
        }

        res.json(post);
    });
});

// Rather than replicating the same code across several different request handler functions,
// we can use Express's param() function to automatically load an object.
router.param('post', function (req, res, next, id) {
    var query = Post.findById(id);

    query.exec(function (err, post) {
        if (err) {
            return next(err);
        }
        if (!post) {
            return next(new Error('can\'t find post'));
        }

        req.post = post;
        return next();
    });
});

//GET/posts/:posts get post at a specific location
router.get('/posts/:post', function (req, res) {
    //populat function retrives comments along with the posts
    req.post.populate('comments', function (err, post) {
        if (err) {
            return next(err);
        }
        res.json(post);
    });
});

//PUT/posts/:post/upvote upvote post at particular id
router.put('/posts/:post/upvote', auth,function (req, res, next) {
    req.post.upvote(function (err, post) {
        if (err) {
            return next(err);
        }

        res.json(post);
    });
});

//POST/posts/:post/comments
router.post('/posts/:post/comments',auth,function (req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;  //associate comment with post

    comment.save(function (err, comment) {
        if (err) {
            return next(err);
        }

        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) {
                return next(err);
            }
            res.json(comment);
        });
    });
});

//router.param() for comments
router.param('comment', function (req, res, next, id) {
    var query = Comment.findById(id);

    query.exec(function (err, comment) {
        if (err) {
            return next(err);
        }
        if (!comment) {
            return next(new Error('can\'t find comment'));
        }

        req.comment = comment;
        return next();
    });
});

//POST/posts/:post/comments/:comment/upvote
router.put('/posts/:post/comments/:comment/upvote', auth,function (req, res, next) {
    req.comment.upvote(function (err, post) {
        if (err) {
            return next(err);
        }
        res.json(post);
    });
});

// POST/register
router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.username) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password);

    user.save(function (err) {
        if (err) {
            return next(err);
        }


        return res.json({token: user.generateJWT()});
    });
});

// POST/login
router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);

        if (user) {
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
