'use strict';

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Task = mongoose.model('Task');
const assign = Object.assign;

exports.load = async(function*(req, res, next, id) {
  try {
    req.task = yield Task.load(id);
    if (!req.task) return next(new Error('Task not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

exports.index = async(function*(req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const tasks = yield Task.list(options);
  const count = yield Task.countDocuments();

  res.render('tasks/index', {
    title: 'Tasks',
    tasks: tasks,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New task
 */

exports.new = function(req, res) {
  res.render('tasks/new', {
    title: 'New Task',
    task: new Task()
  });
};

/**
 * Create an task
 */

exports.create = async(function*(req, res) {
  const task = new Task(only(req.body, 'name'));
  try {
    task.averageTime = parseInt(req.body.averageTime);
  } catch (err) {
    console.log(err);
  }
  task.user = req.user;
  try {
    yield task.validateAndSave();
    req.flash('success', 'Successfully created task!');
    res.redirect(`/tasks/${task._id}`);
  } catch (err) {
    res.status(422).render('tasks/new', {
      title: task.name || 'New Task',
      errors: [err.toString()],
      task
    });
  }
});

/**
 * Edit an task
 */

exports.edit = function(req, res) {
  res.render('tasks/edit', {
    title: 'Edit ' + req.task.name,
    task: req.task
  });
};

/**
 * Update task
 */

exports.update = async(function*(req, res) {
  const task = req.task;
  assign(task, only(req.body, 'title averageTime'));
  try {
    yield task.validateAndSave();
    res.redirect(`/tasks/${task._id}`);
  } catch (err) {
    res.status(422).render('tasks/edit', {
      title: 'Edit ' + task.name,
      errors: [err.toString()],
      task
    });
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  res.render('tasks/show', {
    title: req.task.name,
    task: req.task
  });
};

/**
 * Delete an task
 */

exports.destroy = async(function*(req, res) {
  yield req.task.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/tasks');
});
