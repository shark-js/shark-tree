'use strict';

const VError            = require('verror');
const SrcCollection     = require('./src-collection');
const Logger            = require('shark-logger');
const co                = require('co');
const expand            = require('expand');

function *SharkTree(paths, logger) {
	var options = {};

	yield co(function *() {
		for (var destPath in paths) {
			if (paths.hasOwnProperty(destPath)) {
				var dataExpanded = [];
				var dataType = ({}).toString.call(paths[destPath]);
				switch(dataType) {
					case '[object String]':
					case '[object Array]':
						dataExpanded = yield expand(paths[destPath]);
						break;

					case '[object Object]':
						dataExpanded = yield expand(paths[destPath].files || []);
						options = paths[destPath].options || {};
						break;

					default:
						throw new VError('Invalid dataType "%s"', dataType);
						break;
				}

				paths[destPath] = {
					files: dataExpanded,
					options: options
				};
			}
		}
	});

	var instance = new SharkTreeInternal(paths, logger);
	// ugly hack to use .name in comparing instead of intanceof, need refactor
	instance.constructor = SharkTree;
	return instance;
}

function SharkTreeInternal(data, logger) {
	if (!(this instanceof SharkTreeInternal)) {
		return new SharkTreeInternal(data, logger);
	}

	this._tree = {};

	if (typeof logger === 'undefined') {
		throw new VError('logger argument is empty');
	}

	if (logger.constructor && logger.constructor.name !== Logger.INTERNAL_LOGGER.name) {
		throw new VError('logger is not instanceof SharkLogger');
	}

	this.logger = logger;

	if (Object.keys(data).length === 0) {
		throw new VError('paths is empty object');
	}

	Object.keys(data).forEach(function(destPath) {
		if (this._tree.hasOwnProperty(destPath)) {
			throw new VError('tree already has property "%s"', destPath);
		}

		this._tree[destPath] = new SrcCollection(data[destPath], destPath);
	}.bind(this));
}

SharkTreeInternal.prototype = {
	constructor: SharkTreeInternal,

	forEach: function(cb) {
		var tree = this._tree;
		Object.keys(tree).forEach(function(destPath) {
			cb(destPath, tree[destPath]);
		});
	},

	getTree: function() {
		return this._tree;
	},

	forEachDestSeries: function(cb) {
		return new Promise(function(fulfill, reject) {
			var tree = this._tree;
			var dests = Object.keys(tree);
			var destsCount = dests.length;

			var nextIteration = function(index) {
				var dest = dests[index];
				var srcCollection = tree[dest];
				cb(dest, srcCollection, function(error) {
					var newIndex = index + 1;
					if (error) {
						reject(new VError(error), 'Tree#forEachDestSeries nextIteration error');
					}
					else {
						if (newIndex < destsCount) {
							nextIteration(newIndex);
						}
						else {
							fulfill();
						}
					}
				});
			};

			if (destsCount === 0) {
				fulfill();
			}
			else {
				nextIteration(0);
			}
		}.bind(this));
	},

	hasDest: function(destPath) {
		return this._tree.hasOwnProperty(destPath);
	},

	getSrcCollectionByDest: function(destPath) {
		return this._tree[destPath];
	},

	fillContent: function *() {
		for (var destPath in this._tree) {
			if (this._tree.hasOwnProperty(destPath)) {
				try {
					var srcCollection = this.getSrcCollectionByDest(destPath);
					yield srcCollection.fillContent();
				}
				catch (error) {
					throw new VError(error);
				}
			}
		}
	},

	writeContentToFiles: function() {
		return this.forEachDestSeries(co.wrap(function *(destPath, srcCollection, done) {
			try {
				yield srcCollection.writeContentToFile();
				done();
			}
			catch (error) {
				done(new VError(error, 'Tree#writeContentToFiles error'));
			}
		}.bind(this)));
	}
};

module.exports = SharkTree;