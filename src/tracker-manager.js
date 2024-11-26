import * as fs from 'fs';
import {Socket} from 'dgram'
import URLParse from 'url-parse'
import * as dgram from 'dgram';
import bencode from 'bencode'


export class TrackerManger {
    constructor(torrent){
        const torrentFileContent = fs.readFileSync(torrent);
        this.tracker = bencode.decode(torrentFileContent , 'utf8');
        this.url = this.parseUrl(this.tracker.announce);
        this.socket = dgram.createSocket('udp4');
    }

    parseUrl(url){
        const parsedUrl = URLParse(url);
        console.log('this is my Parsed Url : ', parsedUrl );

        if(!parsedUrl.port){
            parsedUrl.port = '6969';
        }

        console.log(parsedUrl.port , 'portp')
        console.log(parsedUrl.protocol, 'protocol')

        return parsedUrl;
    }

    udpSendRequest( request  ,callback){
        console.log(this.url.port , 'port')
        this.socket.send(request , 0 , request.length , Number(this.url.port) , this.url.hostname , (data)=>{
            console.log('this is my data :' , data)
        })
        this.socket.on('message' , (response)=> {callback(response)})
    }
}