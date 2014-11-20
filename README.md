SharkTree API
==========
## SharkTree

#### void forEach(function callback)
###### callback(string destPath, SharkSrcFile srcFile)

#### boolean hasDest(string destPath)
#### SharkSrcFiles getSrcFilesByDest(string destPath)


## SharkSrcFiles
#### void forEach(function callback)
###### void callback(SharkSrcFile srcFile, number index)
#### SharkSrcFile srcFile(number index)
#### object options
#### string filesContent
#### boolean hasFilesContent
#### number srcFilesCount
#### SharkSrcFile firstSrcFile

## SharkSrcFile
#### string src(string value)
#### string content(string value)
#### boolean isInFilesContent
