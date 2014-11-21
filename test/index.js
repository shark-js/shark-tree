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

	it('should throw error if logger is not set', function() {
		expect(function() {
			Tree([]);
		}).to.throw('logger argument is empty');

		expect(function() {
			Tree('hello world', {});
		}).to.throw('logger is not instanceof SharkLogger');
	});

	it('should throw error if data is not {dst: src} like object', function() {
		expect(function() {
			Tree([], this.logger);
		}.bind(this)).to.throw();

		expect(function() {
			Tree('hello world', this.logger);
		}.bind(this)).to.throw();
	});

	it('should throw error if data is empty object', function() {
		expect(function() {
			Tree({}, this.logger);
		}.bind(this)).to.throw('paths is empty object');
	});

	it('should not throw error if data is {dst: src} like object', function() {
		expect(function() {
			Tree({
				'dest/path': 'src/path'
			}, this.logger);
		}.bind(this)).not.to.throw();
	});
});

describe('Parse paths', function() {
	before(function() {
		this.logger = Logger({
			name: 'SharkTreeLogger'
		});
	});

	describe('strData', function() {
		before(function() {
			this.tree = Tree({
				'dest/path': 'src/path'
			}, this.logger);
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path')).to.be.an.instanceof(SrcCollection);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getFirstFile().getSrc()).equal('src/path');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getCount()).equal(1);
		});
	});

	describe('arrData', function() {
		before(function() {
			this.tree = Tree({
				'dest/path': ['src/path/1', 'src/path/2']
			}, this.logger);
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path')).to.be.an.instanceof(SrcCollection);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getFileByIndex(0).getSrc()).equal('src/path/1');
			expect(this.tree.getSrcCollectionByDest('dest/path').getFileByIndex(1).getSrc()).equal('src/path/2');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getCount()).equal(2);
		});
	});

	describe('objData', function() {
		before(function() {
			this.tree = Tree({
				'dest/path': {
					files: ['src/path/1', 'src/path/2'],
					options: {}
				}
			}, this.logger);
		});

		it('should have "dest/path" as property', function() {
			expect(this.tree.hasDest('dest/path')).to.be.true;
		});

		it('should have "dest/path" as instanceof SharkSrcFiles', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path')).to.be.an.instanceof(SrcCollection);
		});

		it('should output valid src', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getFileByIndex(0).getSrc()).equal('src/path/1');
			expect(this.tree.getSrcCollectionByDest('dest/path').getFileByIndex(1).getSrc()).equal('src/path/2');
		});

		it('should output valid srcFilesCount', function() {
			expect(this.tree.getSrcCollectionByDest('dest/path').getCount()).equal(2);
		});
	});
});

describe('Fill content', function() {
	before(function() {
		this.logger = Logger({
			name: 'SharkTreeLogger'
		});

		this.tree = Tree({
			'dest/path': {
				files: [
					path.join(__dirname, './fixtures/1.txt'),
					path.join(__dirname, './fixtures/2.txt'),
					path.join(__dirname, './fixtures/3.txt'),
				],
				options: {}
			}
		}, this.logger);
	});

	it('should fill content from *.txt files', function *() {
		var srcCollection = this.tree.getSrcCollectionByDest('dest/path');
		yield srcCollection.fillContent();

		expect(srcCollection.getCount()).equal(3);

		expect(srcCollection.getFileByIndex(0).getContent()).equal('hello');
		expect(srcCollection.getFileByIndex(1).getContent()).equal('world');
		expect(srcCollection.getFileByIndex(2).getContent()).equal('lorem ipsum');
	});

	it('should fill content from *.txt files and transform to oneToOne', function *() {
		this.tree = Tree({
			'dest/path': {
				files: [
					path.join(__dirname, './fixtures/1.txt'),
					path.join(__dirname, './fixtures/2.txt'),
					path.join(__dirname, './fixtures/3.txt'),
				],
				options: {}
			}
		}, this.logger);


		var srcCollection = this.tree.getSrcCollectionByDest('dest/path');
		yield srcCollection.fillContent();
		expect(srcCollection.getCount()).equal(3);

		srcCollection.transformToOneToOne();
		expect(srcCollection.getCount()).equal(1);

		expect(srcCollection.getFirstFile().getContent()).equal('helloworldlorem ipsum');
		expect(srcCollection.getFirstFile().getSrc()).to.be.null();
	});
});

describe('write content', function() {
	before(function *() {
		this.logger = Logger({
			name: 'SharkTreeLogger'
		});

		this.destPathA = path.join(__dirname, './fixtures/dest-a.txt');
		this.destPathB = path.join(__dirname, './fixtures/dest-b.txt');

		var files = {};
		files[this.destPathA] = {
			files: [
				path.join(__dirname, './fixtures/1.txt'),
				path.join(__dirname, './fixtures/2.txt'),
				path.join(__dirname, './fixtures/3.txt'),
			],
			options: {}
		};
		files[this.destPathB] = {
			files: [
				path.join(__dirname, './fixtures/2.txt'),
				path.join(__dirname, './fixtures/3.txt'),
			],
			options: {}
		};

		this.tree = Tree(files, this.logger);

		yield cofse.writeFile(this.destPathA, '');
		yield cofse.writeFile(this.destPathB, '');
	});

	it('should fill content from *.txt files and write it on the disk', function *() {
		yield this.tree.fillContent();

		var collectionA = this.tree.getSrcCollectionByDest(this.destPathA);
		var collectionB = this.tree.getSrcCollectionByDest(this.destPathB);

		expect(collectionA.getCount()).equal(3);
		expect(collectionB.getCount()).equal(2);

		expect(collectionA.getFileByIndex(0).getContent()).equal('hello');
		expect(collectionA.getFileByIndex(1).getContent()).equal('world');
		expect(collectionA.getFileByIndex(2).getContent()).equal('lorem ipsum');

		expect(collectionB.getFileByIndex(0).getContent()).equal('world');
		expect(collectionB.getFileByIndex(1).getContent()).equal('lorem ipsum');

		yield this.tree.writeContentToFiles();

		var contentDestPathA = yield cofse.readFile(this.destPathA, {encoding: 'utf8'});
		var contentDestPathB = yield cofse.readFile(this.destPathB, {encoding: 'utf8'});

		expect(contentDestPathA).equal('helloworldlorem ipsum');
		expect(contentDestPathB).equal('worldlorem ipsum');
	});
});