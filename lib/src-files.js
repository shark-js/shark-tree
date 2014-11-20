'use strict';

const VError    = require('VError');
const SrcFile   = require('./src-file');

function SharkSrcFiles(data) {
	var srcArr = [];
	var filesContent = null;
	var options = {};

	var dataType = ({}).toString.call(data);

	switch(dataType) {
		case '[object String]':
			srcArr.push(new SrcFile({
				src: data,
				content: null,
				inFilesContent: false
			}));
			break;

		case '[object Array]':
			data.forEach(function(value) {
				srcArr.push(new SrcFile({
					src: value,
					content: null,
					inFilesContent: false
				}));
			});
			break;

		case '[object Object]':
			if (data.files) {
				data.files.forEach(function(value) {
					srcArr.push(new SrcFile({
						src: value,
						content: null,
						inFilesContent: false
					}));
				});
			}
			else {
				throw new VError('Data object has no "files" property');
			}

			if (data.options) {
				options = data.options;
			}
			break;

		default:
			throw new VError('Invalid dataType "%s"', dataType);
			break;
	}

	this._srcArr = srcArr;
	this._options = options;
	this._filesContent = filesContent;
}

SharkSrcFiles.prototype = {
	constructor: SharkSrcFiles,

	srcFile: function(index) {
		if (typeof index !== 'number') {
			throw new VError('srcFile index is not a number');
		}

		return this._srcArr[index];
	},

	options: function() {
		return this._options;
	},

	filesContent: function() {
		return this._filesContent;
	},

	hasFilesContent: function() {
		return this._filesContent !== null;
	},

	srcFilesCount: function() {
		return this._srcArr.length;
	},

	firstSrcFile: function() {
		if (this.srcFilesCount() > 0) {
			return this._srcArr[0];
		}
		else {
			return null;
		}
	},

	forEach: function(cb) {
		this._srcArr.forEach(function(srcFile, index) {
			cb(srcFile, index);
		});
	}
};

module.exports = SharkSrcFiles;