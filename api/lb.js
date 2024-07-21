const db = require("../modules/db.js")
module.exports = (app) => {
    app.get("/lb", async (req, res) => {
        await db.client.connect()
        var data = await db.collections.threads.find({
            time: {
                $exists: 1
            },
            accepted: true
        }, {
            uid: 1, time: 1
        }).sort({
            time: 1
        }).toArray()
        data = data.map((item, index) => ({
            uid: item.uid,
            time: item.time,
            placement: index + 1
        }));
        await db.client.close()

        return res.json({ success: true, data })
    })
    return {
        method: "GET",
        route: "/lb"
    }
}