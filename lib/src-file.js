'use strict';

function SharkSrcFile(data) {
	this._src = data.src;
	this._content = data.content;
	this._inFilesContent = data.inFilesContent;
}

SharkSrcFile.prototype = {
	constructor: SharkSrcFile,
	src: function() {
		return this._src;
	},

	content: function() {
		return this._content;
	},

	inFilesContent: function() {
		return this._inFilesContent;
	}
};

module.exports = SharkSrcFile;