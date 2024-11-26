import * as fs from 'fs';
import bencode from 'bencode';
import URLParse from  'url-parse';
import * as dgram from 'dgram';
import { TrackerManger } from './tracker-manager.js';

function getUrl(torrentFilePath){
    const torrentFileContent = fs.readFileSync(torrentFilePath);
    const torrentFileContentDecoded = bencode.decode(torrentFileContent , 'utf8');
    const trackerUdpUrl = torrentFileContentDecoded['announce-list'][1];
    console.log(trackerUdpUrl)
    return trackerUdpUrl;
}

const url = getUrl('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/t9.torrent');
const trackerManager = new TrackerManger('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/t9.torrent');
const parsedUrl = trackerManager.parseUrl(url);
const socket = dgram.createSocket('udp4');

trackerManager.udpSendRequest(socket , "hello" , parsedUrl);

socket.on('message' , (response)=>{
    console.log('my response is  : ' , response)
})
