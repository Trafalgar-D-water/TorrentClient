
import URLParse from  'url-parse';
import * as dgram from 'dgram';
import { TrackerManger } from './tracker-manager.js';

const trackerManager = new TrackerManger('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/t9.torrent');
trackerManager.udpSendRequest(trackerManager.connectRequest() , (response) =>{console.log('my response is :' , response)})