import { Elysia, t } from "elysia";

import { app } from "../../index";
import { validateAuthToken } from "../auth/utils";


export const socketApp = new Elysia({
    websocket: {
        idleTimeout: 30,
        perMessageDeflate: true,
    }
});

socketApp.ws('/ws', {
    body: t.Object({
        t: t.String(), //type
        d: t.Any()  //data
    }),
    open(ws) {
        ws.send({ t: 'ping' });
    },
    message(ws, message) {
        if (message.t === 'ping') {
            ws.send({ t: 'pong' });
        }
        if (message.t === 'join') {
            validateAuthToken(message.d.token).then((valid) => {
                if (valid) {
                    ws.subscribe(message.d.room);
                    ws.send({ t: 'status', d: { action: 'join', message: 'success' } });
                } else {
                    ws.send({ t: 'status', d: { action: 'join', message: 'unauthorized' } });
                }
            }).catch((e) => {
                ws.send({ t: 'status', d: { action: 'join', message: 'error', error: e } });
            });
        }
        if (message.t === 'leave') {
            ws.unsubscribe(message.d.room);
            ws.send({ t: 'status', d: { action: 'leave', message: 'success' } });
        }
    },
    close(ws) {
        //ws.unsubscribe()
    },
    beforeHandle() {

    }
})

export const pushMessage = (room: string, data: any) => {
    app.server?.publish(room, JSON.stringify({ t: 'message', d: { room, data } }));
}
