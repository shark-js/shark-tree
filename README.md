SharkTree API
==========
## SharkTree

#### void forEachDestSeries(function callback)
###### callback(string destPath, SharkTreeSrcCollection srcCollection, function doneCallback)
#### boolean hasDest(string destPath)
#### SharkTreeSrcCollection getSrcCollectionByDest(string destPath)


## SharkTreeSrcCollection
#### void forEachSeries(function callback)
###### void callback(SharkTreeSrcFile srcFile, number index, function doneCallback)
#### SharkTreeSrcFile getFileByIndex(number index)
#### object getOptions
#### string getContent
#### void setContent(string content)
#### boolean wasContentFilled
#### number getCount
#### SharkTreeSrcFile getFirstFile
#### void fillContent

## SharkTreeSrcFile
#### string getSrc(string value)
#### string setSrc(string value)
#### string getContent(string content)
#### string setContent(string content)
#### boolean wasContentFilled
#### void fillContent
