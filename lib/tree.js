'use strict';

const VError            = require('verror');
const SrcCollection     = require('./src-collection');
const Logger            = require('shark-logger');
const co                = require('co');

function SharkTree(paths, logger) {
	if (!(this instanceof SharkTree)) {
		return new SharkTree(paths, logger);
	}

	this._tree = {};

	if (typeof logger === 'undefined') {
		throw new VError('logger argument is empty');
	}

	if (logger.constructor && logger.constructor.name !== Logger.INTERNAL_LOGGER.name) {
		throw new VError('logger is not instanceof SharkLogger');
	}

	this.logger = logger;

	var pathsType = ({}).toString.call(paths);
	if (pathsType !== '[object Object]') {
		throw new VError('paths type is not {dest: src} like object, paths is "%s"', pathsType);
	}

	if (Object.keys(paths).length === 0) {
		throw new VError('paths is empty object');
	}

	Object.keys(paths).forEach(function(destPath) {
		if (this._tree.hasOwnProperty(destPath)) {
			throw new VError('tree already has property "%s"', destPath);
		}

		this._tree[destPath] = new SrcCollection(paths[destPath], destPath);
	}.bind(this));
}

SharkTree.prototype = {
	constructor: SharkTree,

	forEach: function(cb) {
		var tree = this._tree;
		Object.keys(tree).forEach(function(destPath) {
			cb(destPath, tree[destPath]);
		});
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
						reject(new VError(error));
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

	fillContent: function() {
		return this.forEachDestSeries(co.wrap(function *(destPath, srcCollection, done) {
			try {
				yield srcCollection.fillContent();
				done();
			}
			catch (error) {
				done(new VError(error));
			}
		}.bind(this)));
	},

	writeContentToFiles: function() {
		return this.forEachDestSeries(co.wrap(function *(destPath, srcCollection, done) {
			try {
				yield srcCollection.writeContentToFile();
				done();
			}
			catch (error) {
				done(new VError(error));
			}
		}.bind(this)));
	}
};

module.exports = SharkTree;