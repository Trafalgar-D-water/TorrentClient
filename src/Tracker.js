import { Http, Udp } from "./network.js";
import { TrackerState } from "./type/TrackerState.js";
export class Tracker {
    constructor(url, torrent, state = TrackerState.STOPPED) {
        this.torrent = torrent;
        this.state = state;
        this.url = new URL(url);
        if (this.url.protocol == "udp:") {
            this.network = new Udp();
        }
        else {
            this.network = new Http();
        }
    }
    async announce(trackerEvent) {
            this.state = TrackerState.CONNECTING;
            const resp = await this.network.connect(this.url, trackerEvent, this.torrent);
            return resp;
    }
}
Tracker.events = {
    STARTED: "started",
    COMPLETED: "completed",
    STOPPED: "stopped",
};
