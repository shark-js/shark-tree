'use strict';

const VError    = require('VError');
const SrcFile   = require('./src-file');
const co        = require('co');

function SharkTreeSrcCollection(data) {
	var srcArr = [];
	var content = null;
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
	this._content = content;
}

SharkTreeSrcCollection.prototype = {
	constructor: SharkTreeSrcCollection,

	getFileByIndex: function(index) {
		if (typeof index !== 'number') {
			throw new VError('srcFile index is not a number');
		}

		if (this.hasFileByIndex(index)) {
			return this._srcArr[index];
		}
		else {
			return null;
		}
	},

	hasFileByIndex: function(index) {
		if (typeof index !== 'number') {
			throw new VError('srcFile index is not a number');
		}

		return !!this._srcArr[index];
	},

	getOptions: function() {
		return this._options;
	},

	getContent: function() {
		return this._content;
	},

	setContent: function(content) {
		this._content = content;
	},

	wasContentFilled: function() {
		return this._content !== null;
	},

	getCount: function() {
		return this._srcArr.length;
	},

	getFirstFile: function() {
		if (this.getCount() > 0) {
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
	},

	forEachSeries: function(cb) {
		return new Promise(function(fulfill, reject) {
			var srcArr = this._srcArr;
			var filesCount = this.getCount();

			var nextIteration = function(index) {
				var file = srcArr[index];
				cb(file, index, function(error) {
					var newIndex = index + 1;
					if (error) {
						reject(new VError(error));
					}
					else {
						if (newIndex < filesCount) {
							nextIteration(newIndex);
						}
						else {
							fulfill();
						}
					}
				});
			};

			if (filesCount === 0) {
				fulfill();
			}
			else {
				nextIteration(0);
			}
		}.bind(this));
	},

	fillContent: function() {
		return this.forEachSeries(co.wrap(function *(srcFile, index, done) {
			try {
				yield srcFile.fillContent();
				done();
			}
			catch (error) {
				done(new VError(error));
			}
		}.bind(this)));
	}
};

module.exports = SharkTreeSrcCollection;