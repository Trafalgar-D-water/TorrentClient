import * as fs from 'fs';
import bencode from 'bencode';
import * as crypto from "crypto";
import BigNum from "bignum";

export class  TorrentParser {
    constructor(torrentFilePath){
        this.torrentFilePath = torrentFilePath;
        this.torrentFileContent = bencode.decode(fs.readFileSync(torrentFilePath) , 'utf8');
        console.log(this.torrentFileContent, 'torrentFileContent');
    }

    get infoHash(){
        console.log("infoooo : ", this.info);
            return crypto.createHash('sha1').update(bencode.encode(this.torrent.info)).digest();
    }
 
    get size(){
        const size = this.torrent.info.files 
            ? this.torrent.info.files.map((file) => file.length).reduce((a , b)=> a+b) : this.torrent.info.length;
        return BigNum.toBuffer(size , {size : 8,endian : 'little'})
    }

    get torrent(){
        return this.torrentFileContent;
    }
    get trackersUrls(){
        return this.torrentFileContent['announce-list'];
    }

    get mainUdpUrl(){
        return this.torrentFileContent['announce-list'][2];
    }

    get announceUrl(){
        return this.torrentFileContent["announce"];
    }

    get info() {
        return this.torrentFileContent['info'];
    }

    get pieces() {
        return this.torrentFileContent.info['pieces']
    }
}