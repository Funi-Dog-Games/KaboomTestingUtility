const db = require("../modules/db")
module.exports = (app) => {
    app.post("/end", async (req, res) => {
        const { body } = req
        if(!body || !body.uid) return res.status(404).send("Invalid UID");

        await db.client.connect()
        const thread = db.collections.threads.findOne({ uid: body.uid, active: true })
        if(!thread) return res.status(404).send("Session not found");
        app.client.channels.cache.find(id => id.id == thread.channel).threads.cache.find(id => id.id == thread.tid).send("Session has been ended automatically!")
        await db.client.close()
    })
    return {
        method: "POST",
        route: "/end"
    }
}