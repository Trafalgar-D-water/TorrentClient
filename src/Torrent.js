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
            if (this.metadata.announce) {
                this.trackers.push(new Tracker(this.metadata.announce, this));
            }
            if (this.metadata.announceList) {
                for (const a of this.metadata.announceList) {
                    this.trackers.push(new Tracker(a, this));
                }
            }
            for (const t of this.trackers) {
                const resp = await t.announce(Tracker.events.STARTED);
                console.log(resp);
            }
    }
}
