import {Socket} from 'dgram'
import URLParse from 'url-parse'
import * as dgram from 'dgram';


export class TrackerManger {
    constructor(trackerUdpUrl){
        this.trackerUdpUrl = trackerUdpUrl;
    }

    parseUrl(url){
        const parserdUrl = URLParse(url);
        console.log('this is my parsed Url : ' , parserdUrl);
        return parserdUrl;
    }

    udpSendRequest(socket = Socket , request  , url){
        socket.send(request , 0 , request.length , url.port , url.hostname , (data)=>{
            console.log('this is my data :' , data)
        })
    }
}