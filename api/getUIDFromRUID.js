const db = require("../modules/db")
module.exports = (app) => {
    app.post("/getUIDFromRUID", async (req, res) => {
        const { body } = req
        if(body == undefined || body.ruid == undefined) return res.status(400).json({ success: false, message: "RUID not provided"})
        await db.client.connect()
        const user = await db.collections.users.findOne({ ruid: body.ruid })
        if(user == undefined || user.uid == undefined) return res.status(404).json({ success: false, message: "User not found or not registered" })
        
        res.status(200).json({ success: true, uid: user.uid })
    })
    return {
        method: "POST",
        route: "/getUIDFromRUID"
    }
}