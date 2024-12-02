import * as fs from "fs";
import { Socket } from "dgram";
import URLParse from "url-parse";
import * as dgram from "dgram";
import bencode from "bencode";
import { randomBytes } from "crypto";
import { Buffer } from "buffer";
import { ActionsType } from "./type/requestAction.js";
import { TorrentParser } from "./torrent-parser.js";
import * as crypto from "crypto";
import {Events} from './type/event.js'
import axios from "axios";

export class TrackerManager {
  constructor(torrent) {
    this.torrentParser = new TorrentParser(torrent);
    this.socket = dgram.createSocket("udp4");
    this.id = null; 
  }

  respType(resp) {
    const action = resp.readUInt32BE(0);
    console.log('the action : ' , action)
    if (action === 0) return "connect";
    if (action === 1) return "announce";
    if (action === 2) return "scrape";
    if (action === 3) return "error";
  }

  genId() {
    if (!this.id) {
      this.id = crypto.randomBytes(20);
      Buffer.from("-AT0001-").copy(this.id, 0);  // Ensure correct buffer handling
    }

    return this.id;
  }

  async getPeers(callback = (r) => console.log("response", r)) {
    // 1. Send connection request
    this.udpSendRequest(this.connectRequest());

    this.socket.on("message", (response) => {
      if (this.respType(response) === 'connect') {
        // Receive and parse connection response
        const connResp = this.parseConnectResponse(response);
        console.log("response:", connResp);
        // Send announce request
        const announceReq = this.announceRequest(connResp.connectionId);
        this.udpSendRequest(announceReq);
      } else if (this.respType(response) === 'announce') {
        // Parse announce response
        const announceResp = this.parseAnnounceResponse(response);
        // Pass peers to callback
        callback(announceResp);
      } else if (this.respType(response) === 'error') {
        console.log('Error in the response');
        console.log('the parsed error is :' , this.parseError(response));
      }
    });
  }

  parseAnnounceResponse(resp) {
    function group(iterable, groupSize) {
      let groups = [];
      for (let i = 0; i < iterable.length; i += groupSize) {
        groups.push(iterable.slice(i, i + groupSize));
      }
      return groups;
    }

    return {
      action: resp.readUInt32BE(0),
      transactionId: resp.readUInt32BE(4),
      interval: resp.readUInt32BE(8),
      leechers: resp.readUint32BE(12),
      seeders: resp.readUInt32BE(16),
      peers: group(resp.slice(20), 6).map((address) => {
        return {
          ip: address.slice(0, 4).join('.'),
          port: address.readUInt16BE(4),
        };
      }),
    };
  }

  parseUrl(url) {
    const parsedUrl = URLParse(url);
    if (!parsedUrl.port) {
      parsedUrl.port = "6969";
    }

    return parsedUrl;
  }

  udpSendRequest(request , urlTest = this.torrentParser.mainUdpUrl) {
    const url = this.parseUrl(urlTest)
    // const url = this.parseUrl(this.torrentParser.mainUdpUrl);
    this.socket.send(
      request,
      0,
      request.length,
      Number(url.port),
      url.hostname,
      (err, bytes) => {
        if (err) throw err;
      }
    );
    this.socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
    this.socket.on("message", (response, rinfo) => {
      console.log("I am here with response type:", this.respType(response));
    });
  }

  connectRequest() {
    const connectRequestBuffer = Buffer.allocUnsafe(16);

    connectRequestBuffer.writeUInt32BE(0x417, 0);
    connectRequestBuffer.writeUint32BE(0x27101980, 4);
    connectRequestBuffer.writeUint32BE(ActionsType.connect, 8);
    randomBytes(4).copy(connectRequestBuffer, 12);
    return connectRequestBuffer;
  }

  parseConnectResponse(connectResponse) {
    const action = connectResponse.readUInt32BE(0);
    const transactionId = connectResponse.readUInt32BE(4);
    const connectionId = connectResponse.slice(8);  

    let parsedConnectResponse = {
      action: action,
      transactionId: transactionId,
      connectionId: connectionId,
    };

    return parsedConnectResponse;
  }

  announceRequest(connId, port = 6881) {
    const buf = Buffer.allocUnsafe(98);

    if (!Buffer.isBuffer(connId)) {
      throw new TypeError("connId must be a Buffer");
    }

    connId.copy(buf, 0);
    // Action
    buf.writeUInt32BE(ActionsType.announce, 8);
    // Transaction ID
    crypto.randomBytes(4).copy(buf, 12);
    // Info hash
    this.torrentParser.infoHash.copy(buf, 16);
    // Peer ID
    this.genId().copy(buf, 36);
    // Downloaded
    Buffer.alloc(8).copy(buf, 56);
    // Left
    this.torrentParser.size.copy(buf, 64);
    // Uploaded
    Buffer.alloc(8).copy(buf, 72);
    // Event
    buf.writeUInt32BE(0, 80);
    // IP address
    buf.writeUInt32BE(0, 84);
    // Key
    crypto.randomBytes(4).copy(buf, 88);
    // Num want
    buf.writeInt32BE(-1, 92);
    // Port
    buf.writeUInt16BE(port, 96);

    return buf;
  }

  getBufferUInt64BE(n) {
    let buf = Buffer.alloc(8);
    buf.writeUint32BE(n, 4);
  }

  parseError(error) {
    return {
      action: error.readUInt32BE(0),
      transactionId: error.readUInt32BE(4),
      message: error.readUInt32BE(8),
    };
  }


  async httpConnectRequest(){
    const announceUrl  = this.torrentParser.announceUrl;
    const parsedUrl = this.parseUrl(announceUrl);
    const buildedUrl = this.createUrl(Events.STARTED , parsedUrl);
    const response = await axios.get(buildedUrl , {responseType : "arraybuffer" , transformResponse : []});
    console.log("i wish this sucess" , this.parseResp(response.data));
  }

  createUrl(event , parsedUrl){
    let query = { 
      info_hash : "%A6%0D%E3F%E3%9E5%F6%B5%C45q%3E%00S%A29E%3D%D1",
      // info_hash: encodeURIComponent(this.torrentParser.infoHash.toString("binary")),
      peer_id : "-AT0001-"  + Math.random().toString().slice(2 , 14),
      port : parsedUrl.port || 6882,
      uploaded : 0 , 
      downloaded : 0 , 
      left : this.torrentParser.size,
      compact : 1 ,
      event : event ? event : undefined
    }

    let url = parsedUrl.href + "?";
    for(const key in query){
      url += key  + '=' + query[key] + '&';
    }
    console.log('uuuuuuuuuuuuuuuuurl' ,  url);
    return url;
  }

  parseResp(resp){
    const responseInfo = bencode.decode(resp);
    if(responseInfo["failure reason"]){
      return {error : responseInfo["failure reason"].toString()};
    }
    return {
      protocol : "http",
      interval : responseInfo.interval,
      leechers : responseInfo.incomplete,
      seeders : responseInfo.complete,
      peerList : this.getPeersList(responseInfo.peers),
    }
  }

  getPeersList(resp){
    let peersList = [];
    if(Buffer.isBuffer(resp)){
      //compact

      for(let i = 0 ; i< resp.length ; i += 6){
        peerList.push({
          ip : resp.slice(i , i+ 4).join("."),
          port : resp.readUInt16BE(i + 4)
        })
      }
    }
    else{
      //no compact 
      for(let i = 0 ; i< resp.length ; i++){
          peersList.push({
            ip : resp[i].ip.toString(),
            port : resp[i].port
          })
      }
    }
    return peersList;
  }
}
