import * as fs from 'fs';
import bencode from 'bencode';
import URLParse from  'url-parse';

function readFile(torrentFilePath){
    const torrentFileContent = fs.readFileSync(torrentFilePath);
    const torrentFileContentDecoded = bencode.decode(torrentFileContent , 'utf8');
    console.log('this is the url : ' , torrentFileContentDecoded.announce);
    console.log('The parsed url is : ' , URLParse(torrentFileContentDecoded.announce));
}

readFile('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/puppy.torrent')