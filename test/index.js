'use strict';

const expect    = require('chai').expect;
const VError    = require('verror');
const Tree      = require('../lib/tree');
const SrcFiles  = require('../lib/src-files');

describe('Initialization',function(){
	it('should throw error if data is not {dst: src} like object', function() {
		expect(function() {
			new Tree([]);
		}).to.throw();

		expect(function() {
			new Tree('hello world');
		}).to.throw();
	});

	it('should throw error if data is empty object', function() {
		expect(function() {
			new Tree({});
		}).to.throw('paths is empty object');
	});

	it('should not throw error if data is {dst: src} like object', function() {
		expect(function() {
			new Tree({
				'dest/path': 'src/path'
			});
		}).not.to.throw();
	});
});

describe('Parse paths', function() {
	describe('strData', function() {
		before(function() {
			this.tree = new Tree({
				'dest/path': 'src/path'
			});
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcFilesByDest('dest/path')).to.be.an.instanceof(SrcFiles);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').firstSrcFile().src()).equal('src/path');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').srcFilesCount()).equal(1);
		});
	});

	describe('arrData', function() {
		before(function() {
			this.tree = new Tree({
				'dest/path': ['src/path/1', 'src/path/2']
			});
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcFilesByDest('dest/path')).to.be.an.instanceof(SrcFiles);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').srcFile(0).src()).equal('src/path/1');
			expect(this.tree.getSrcFilesByDest('dest/path').srcFile(1).src()).equal('src/path/2');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').srcFilesCount()).equal(2);
		});
	});

	describe('objData', function() {
		before(function() {
			this.tree = new Tree({
				'dest/path': {
					files: ['src/path/1', 'src/path/2'],
					options: {}
				}
			});
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcFilesByDest('dest/path')).to.be.an.instanceof(SrcFiles);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').srcFile(0).src()).equal('src/path/1');
			expect(this.tree.getSrcFilesByDest('dest/path').srcFile(1).src()).equal('src/path/2');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcFilesByDest('dest/path').srcFilesCount()).equal(2);
		});
	});
});