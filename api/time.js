const db = require("../modules/db.js")
module.exports = (app) => {
    app.post("/time", async (req, res) => {
        const { body } = req
        if(!body || !body.uid) return res.status(404).json({ success: false, message: "UID not provided" });

        await db.client.connect()
        var data = await db.collections.threads.find({
            uid: body.uid,
            time: {
                $exists: 1
            }
        }, {
            time: 1
        }).toArray()

        if(!data) return res.status(404).json({ success: false, message: "User does not have any approved sessions" })

        var s = 0

        data.forEach((entry) => {
            if(entry.time){
                s = s + entry.time
            }
        })
        const hours = Math.floor((s / (60 * 60))).toString().padStart(2, '0');
        const minutes = Math.floor((s / 60) % 60).toString().padStart(2, '0');
        const seconds = Math.floor(s % 60).toString().padStart(2, '0');
        return res.status(200).json({ success: true, data: { hours, minutes, seconds } })
    })
    return {
        method: "POST",
        route: "/time"
    }
}