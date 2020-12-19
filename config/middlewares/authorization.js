'use strict';

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function(req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Pipeline authorization routing middleware
 */

exports.pipeline = {
  hasAuthorization: function(req, res, next) {
    if (req.pipeline.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/pipelines/' + req.pipeline.id);
    }
    next();
  }
};

/*
 *  Task authorization routing middleware
 */

exports.task = {
  hasAuthorization: function(req, res, next) {
    if (req.task.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/tasks/' + req.task.id);
    }
    next();
  }
};
