'use strict';

const expect            = require('chai').expect;
const coMocha           = require('co-mocha');
const VError            = require('verror');
const Tree              = require('../lib/tree');
const SrcCollection     = require('../lib/src-collection');
const Logger            = require('shark-logger');
const path              = require('path');
const cofse             = require('co-fs-extra');

describe('Initialization',function(){
	before(function() {
		this.logger = Logger({
			name: 'SharkTreeLogger'
		});
	});

	it('should parse {"dest/path": "src/path"}', function *() {
		var dest = path.join(__dirname, './fixtures/dest-a.txt');
		var src = path.join(__dirname, './fixtures/1.txt');
		var files = {};
		files[dest] = src;

		var tree = yield Tree(files, this.logger);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(0).getSrc()).equal(src);
	});

	it('should parse {"dest/path": ["src/path/1", "src/path/2"]}', function *() {
		var dest = path.join(__dirname, './fixtures/dest-a.txt');
		var src1 = path.join(__dirname, './fixtures/1.txt');
		var src2 = path.join(__dirname, './fixtures/2.txt');
		var files = {};
		files[dest] = [src1, src2];

		var tree = yield Tree(files, this.logger);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(0).getSrc()).equal(src1);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(1).getSrc()).equal(src2);
	});

	it('should parse {"dest/path": {files: ["src/path/1", "src/path/2"], options: {test: "ipsum"}}}}', function *() {
		var dest = path.join(__dirname, './fixtures/dest-a.txt');
		var src1 = path.join(__dirname, './fixtures/1.txt');
		var src2 = path.join(__dirname, './fixtures/2.txt');
		var files = {};
		files[dest] = {
			files: [src1, src2],
			options: {
				test: 'ipsum'
			}
		};

		var tree = yield Tree(files, this.logger);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(0).getSrc()).equal(src1);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(1).getSrc()).equal(src2);
		expect(tree.getSrcCollectionByDest(dest).getOptions()).eql({test: 'ipsum'});
	});

	it('should exclude invalid path/2 {"dest/path": ["src/path/valid/1", "src/path/invalid/2"]}', function *() {
		var dest = path.join(__dirname, './fixtures/dest-a.txt');
		var src1 = path.join(__dirname, './fixtures/1.txt');
		var src2 = path.join(__dirname, './fixtures/2222-invalid.txt');
		var files = {};
		files[dest] = [src1, src2];

		var tree = yield Tree(files, this.logger);
		expect(tree.getSrcCollectionByDest(dest).getFileByIndex(0).getSrc()).equal(src1);
		expect(tree.getSrcCollectionByDest(dest).getCount()).equal(1);
	});

	it('should createTree from dest', function *() {
		var dest1 = path.join(__dirname, './fixtures/dest-a.txt');
		var dest2 = path.join(__dirname, './fixtures/dest-b.txt');
		var src1 = path.join(__dirname, './fixtures/1.txt');
		var src2 = path.join(__dirname, './fixtures/2.txt');
		var files = {};
		files[dest1] = [src1, src2];
		files[dest2] = [src2];

		var tree = yield Tree(files, this.logger);
		var newTree = yield tree.createTreeFromDest(dest1);
		expect(newTree.hasDest(dest1)).to.be.true;
		expect(newTree.hasDest(dest2)).to.be.false;
	});
});