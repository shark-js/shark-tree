'use strict';

function SharkSrcFile(data) {
	this._src = data.src;
	this._content = data.content;
	this._inFilesContent = data.inFilesContent || false;
}

SharkSrcFile.prototype = {
	constructor: SharkSrcFile,
	src: function(value) {
		if (typeof value !== 'undefined') {
			this._src = value;
		}
		return this._src;
	},

	content: function(value) {
		if (typeof value !== 'undefined') {
			this._content = value;
			this._inFilesContent = true;
		}
		return this._content;
	},

	inFilesContent: function() {
		return this._inFilesContent;
	}
};

module.exports = SharkSrcFile;