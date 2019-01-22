var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
});

// EDIT COMMIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err){
            res.redirect("/campgrounds");
        } else {
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    res.redirect("/campgrounds/" + req.params.id);
                } else {
                    res.render("comments/edit", {campground: foundCampground, comment: foundComment});
                }
            });
        }
    });
});

router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            foundComment.text = req.body.comment.text;
            foundComment.save();
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE COMMENT ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;