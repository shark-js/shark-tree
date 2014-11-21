'use strict';

const cofse     = require('co-fs-extra');
const extend    = require('node.extend');
const VError    = require('verror');

function SharkTreeSrcFile(data) {
	this._src       = data.src;
	this._content   = data.content;
	this._dest      = data.dest;
}

SharkTreeSrcFile.prototype = {
	constructor: SharkTreeSrcFile,

	getSrc: function() {
		return this._src;
	},

	setSrc: function(value) {
		this._src = value;

		return this;
	},

	getContent: function() {
		return this._content;
	},

	setContent: function(content) {
		this._content = content;

		return this;
	},

	wasContentFilled: function() {
		return typeof this._content === 'string';
	},

	fillContent: function *(options) {
		if (this.wasContentFilled()) {
			return;
		}

		try {
			this._content = yield cofse.readFile(this._src, extend({
				encoding: 'utf8'
			}, options));
		}
		catch (error) {
			new VError(error);
		}
	},

	writeContentToFile: function *(options) {
		try {
			yield cofse.writeFile(this._dest, this._content, extend({

			}, options));
		}
		catch (error) {
			throw new VError(error);
		}
	}
};

module.exports = SharkTreeSrcFile;