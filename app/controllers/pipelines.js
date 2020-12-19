'use strict';

const mongoose = require('mongoose');
const path = require('path');
const { wrap: async } = require('co');
const only = require('only');
const Pipeline = mongoose.model('Pipeline');
const Task = mongoose.model('Task');
const assign = Object.assign;

exports.load = async(function*(req, res, next, id) {
  try {
    req.pipeline = yield Pipeline.load(id);
    if (!req.pipeline) return next(new Error('Pipeline not found'));
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

  const pipelines = yield Pipeline.list(options);
  const count = yield Pipeline.countDocuments();

  res.render('pipelines/index', {
    title: 'Pipelines',
    pipelines: pipelines,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New pipeline
 */

exports.new = async function(req, res) {
  const tasks = await Task.list({});
  res.render('pipelines/new', {
    title: 'New Pipeline',
    pipeline: new Pipeline(),
    tasks: tasks
  });
};

/**
 * Create a pipeline
 */

exports.create = async(function*(req, res) {
  const pipeline = new Pipeline(only(req.body, 'name tasks'));
  pipeline.user = req.user;
  try {
    yield pipeline.validateAndSave();
    req.flash('success', 'Successfully created pipeline!');
    res.redirect(`/pipelines/${pipeline._id}`);
  } catch (err) {
    res.status(422).render('pipelines/new', {
      title: pipeline.name || 'New Pipeline',
      errors: [err.toString()],
      pipeline
    });
  }
});

/**
 * Edit an pipeline
 */

exports.edit = async function(req, res) {
  const tasks = await Task.list({});
  res.render('pipelines/edit', {
    title: 'Edit ' + req.pipeline.name,
    pipeline: req.pipeline,
    tasks: tasks
  });
};

/**
 * Update pipeline
 */

exports.update = async(function*(req, res) {
  const pipeline = req.pipeline;
  assign(pipeline, only(req.body, 'name tasks'));
  if (!req.body.tasks) {
    pipeline.tasks = [];
  }
  try {
    yield pipeline.validateAndSave();
    res.sendStatus(200);
  } catch (err) {
    res.status(422).render('pipelines/edit', {
      title: 'Edit ' + pipeline.name,
      errors: [err.toString()],
      pipeline
    });
  }
});

/**
 * Show
 */

exports.show = async function(req, res) {
  const tasks = await Task.list({});
  res.render('pipelines/show', {
    title: req.pipeline.name,
    pipeline: req.pipeline,
    tasks: tasks
  });
};

/**
 * Delete an pipeline
 */

exports.destroy = async(function*(req, res) {
  yield req.pipeline.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/pipelines');
});

/**
 * Calculate average time for pipeline
 */

exports.calculate = async(function(req, res) {
  let result = 0;
  req.pipeline.tasks.forEach(task => {
    result += task.averageTime;
  });

  res.send({
    pid: req.pipeline._id,
    name: req.pipeline.name,
    averageTime: result
  });
});

/**
 * Run pipeline
 */

exports.run = async(function(req, res) {
  let utilityPath = path.normalize(
    __dirname + './../../PipelineConsole/bin/Debug/PipelineConsole.exe'
  );
  let args = ' -pid ' + req.pipeline._id;
  let cmd = utilityPath + args;

  const cp = require('child_process');
  cp.exec(cmd, function(error, stdout, stderr) {
    if (!error && !stderr) {
      const pipeline = req.pipeline;
      pipeline.runTime = parseInt(stdout.split(' ')[0]);
      pipeline.validateAndSave();
      setTimeout(() => {
        global.io.emit(req.user._id, pipeline);
      }, 3000);
    }
  });
  res.sendStatus(200);
});
