var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

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
router.post('/posts', function (req, res, next) {
    var post = new Post(req.body);

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
    req.post.populate('comments',function(err,post){
        if(err){
            return next(err);
        }
        res.json(post);
    });
});

//PUT/posts/:post/upvote upvote post at particular id
router.get('/posts/:post/upvote', function (req, res, next) {
    req.post.upvote(function (err, post) {
        if (err) {
            return next(err);
        }
        res.json(post);
    });
});

//POST/posts/:post/comments
router.post('posts/:post/comments', function (req, res, next) {
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
router.get('/posts/:post/comments/:comment/upvote',function(req,res,next){
    res.comment.upvote(function(err,post){
        if(err){
            return next(err);
        }
        res.json(post);
    });
});


module.exports = router;
