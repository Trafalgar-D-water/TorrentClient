import { TrackerManager } from './tracker-manager.js';

const trackerManager = new TrackerManager('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/t9.torrent');
// trackerManager.udpSendRequest(trackerManager.connectRequest() , (response) =>{console.log('my response is :' , response)});

trackerManager.getPeers();