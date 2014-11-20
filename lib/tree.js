'use strict';

const VError    = require('verror');
const SrcFiles  = require('./src-files');

function SharkTree(paths) {
	this._tree = {};

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

		this._tree[destPath] = new SrcFiles(paths[destPath]);
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

	hasDest: function(destPath) {
		return this._tree.hasOwnProperty(destPath);
	},

	getSrcFilesByDest: function(destPath) {
		return this._tree[destPath];
	}
};

module.exports = SharkTree;