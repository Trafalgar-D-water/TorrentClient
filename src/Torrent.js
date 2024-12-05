import { TorrentParser } from "./TorrentParser.js";
import { Tracker } from "./Tracker.js";
export class Torrent {
    constructor(file, clientId, port, uploaded = 0, downloaded = 0) {
        this.file = file;
        this.clientId = clientId;
        this.port = port;
        this.uploaded = uploaded;
        this.downloaded = downloaded;
        this.trackers = [];
        this.peers = [];
        this.metadata = TorrentParser.instance.parse(file);
        this.start();
    }
    async start() {
            let x = 0 ;
            if (this.metadata.announce) {
                this.trackers.push(new Tracker(this.metadata.announce, this));
            }
            if (this.metadata.announceList) {
                for (let a of this.metadata.announceList) {
                    const url = a.split("/");
                    if(!url.pop().includes("announce")){
                        a = a + "/announce"
                    }
                    this.trackers.push(new Tracker(a, this));

                }
            }
            for (const t of this.trackers) {
                const resp = await t.announce(Tracker.events.STARTED);
                console.log(resp);
            }
    }
}
