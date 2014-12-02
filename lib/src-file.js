'use strict';

const cofse     = require('co-fs-extra');
const extend    = require('node.extend');
const VError    = require('verror');

function SharkTreeSrcFile(data) {
	this._src       = data.src;
	this._content   = data.content;
	this._dest      = data.dest;

	var encoding = data.encoding || null;
	if (typeof encoding === 'string') {
		this._encoding  = {
			read: encoding,
			write: encoding
		}
	}
	else if (({}).toString.call(encoding) === '[object Object]') {
		this._encoding  = {
			read: encoding.read || 'utf8',
			write: encoding.write || 'utf8'
		}
	}
	else {
		this._encoding  = {
			read: 'utf8',
			write: 'utf8'
		}
	}
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

	fillContent: function *(optionsFs) {
		if (this.wasContentFilled()) {
			return;
		}

		try {
			this._content = yield cofse.readFile(this._src, extend({
				encoding: this._encoding.read
			}, optionsFs));
		}
		catch (error) {
			new VError(error, 'SrcFile#fillContent error');
		}
	},

	writeContentToFile: function *(optionsFs) {
		try {
			yield cofse.writeFile(this._dest, this._content, extend({
				encoding: this._encoding.write
			}, optionsFs));
		}
		catch (error) {
			throw new VError(error, 'SrcFile#writeContentToFile error');
		}
	}
};

module.exports = SharkTreeSrcFile;