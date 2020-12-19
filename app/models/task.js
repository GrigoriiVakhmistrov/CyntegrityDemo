'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Task Schema
 */

const TaskSchema = new Schema({
  name: { type: String, default: '', trim: true, maxlength: 400 },
  user: { type: Schema.ObjectId, ref: 'User' },
  averageTime: { type: Number, maxlength: 10 }, //TODO: move to timespan
  createdAt: { type: Date, default: Date.now }
});

/**
 * Validations
 */

TaskSchema.path('name').required(true, 'Task name cannot be blank');
TaskSchema.path('averageTime').required(
  true,
  'Task averageTime cannot be blank'
);

/**
 * Pre-remove hook
 */

TaskSchema.pre('remove', function(next) {
  next();
});

/**
 * Methods
 */

TaskSchema.methods = {
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

TaskSchema.statics = {
  /**
   * Find task by id
   *
   * @param {ObjectId} _id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .exec();
  },

  /**
   * List tasks
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

mongoose.model('Task', TaskSchema);
