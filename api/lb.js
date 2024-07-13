const db = require("../modules/db.js")
module.exports = (app) => {
    app.get("/lb", async (req, res) => {
        await db.client.connect()
        var data = await db.collections.threads.find({
            time: {
                $exists: 1
            }
        }, {
            uid: 1, time: 1
        }).sort({
            time: 1
        }).toArray()
        data = data.slice(1, 10).map((item, index) => ({
            uid: item.uid,
            time: item.time,
            placement: index + 1
        }));
        await db.client.close()

        return res.json(data)
    })
    return {
        method: "GET",
        route: "/lb"
    }
}