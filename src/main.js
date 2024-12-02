import { TrackerManager } from './tracker-manager.js';

const trackerManager = new TrackerManager('/home/priyanshu/Desktop/workshop/torrent-recreation/src/torrent-file/t9.torrent');
trackerManager.httpConnectRequest().then((response)=>{
    console.log(response , 'wala')
})
// trackerManager.getPeers();