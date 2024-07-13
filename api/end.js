const db = require("../modules/db")
module.exports = (app) => {
    app.post("/end", async (req, res) => {
        const { body } = req
        if(!body || !body.uid) return res.status(404).json({ success: true, message: "UID not provided"})

        await db.client.connect()
        const thread = await db.collections.threads.findOne({ uid: body.uid, active: true, reviewed: false })
        if(!thread) return res.status(404).send("Session not found");

        const channel = await app.client.channels.cache.get(thread.channel)
        if(channel){
            const thread = channel.threads.cache.find(id => id.id == thread.tid)
            if(thread){
                thread.send("Session has been ended automatically!")

                await db.collections.threads.updateOne({ tid: thread.tid, active: true, reviewed: false }, {"$set": {
                    uid: thread.uid,
                    tid: thread.tid,
                    active: false,
                    reviewed: true,
                    accepted: true,
                    time: (thread.endTime - thread.startTime) / 1000
                }})

                res.status(200).json({ success: true, message: "Ended"})
            } else {
                res.status(404).json({ success: false, error: "Thread not found"})
            }
        } else {
            res.status(404).json({ success: false, error: "Channel not found"})
        }
        

        await db.client.close()
    })
    
    return {
        method: "POST",
        route: "/end"
    }
}