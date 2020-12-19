'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Pipeline Schema
 */

const PipelineSchema = new Schema({
  name: { type: String, default: '', trim: true, maxlength: 200 },
  user: { type: Schema.ObjectId, ref: 'User' },
  tasks: [
    {
      type: Schema.ObjectId,
      ref: 'Task'
    }
  ],
  createdAt: { type: Date, default: Date.now },
  runTime: { type: Number, default: '0', maxlength: 10 }
});

/**
 * Validations
 */

PipelineSchema.path('name').required(true, 'Task name cannot be blank');

/**
 * Pre-remove hook
 */

PipelineSchema.pre('remove', function(next) {
  next();
});

/**
 * Methods
 */

PipelineSchema.methods = {
  /**
   * Save task
   *
   * @api private
   */

  validateAndSave: function() {
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
  }
};

/**
 * Statics
 */

PipelineSchema.statics = {
  /**
   * Find task by id
   *
   * @param {ObjectId} _id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('tasks', 'name averageTime')
      .exec();
  },

  /**
   * List pipelines
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Pipeline', PipelineSchema);
