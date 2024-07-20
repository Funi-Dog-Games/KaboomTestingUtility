const db = require("../modules/db")

module.exports = (app) => {
    app.post("/start", async (req, res) => {
        const { body } = req.body
        if(!body || !body.ruid) return res.status(400).json({ success: false, message: "RUID not provided" })
        const user = await db.collections.users.findOne({ ruid: body.ruid })
        if(!user) return res.status(404).json({ success: false, message: "User not found or not registered" })
        const d_user = app.client.users.cache.find(id => id.id === user.uid)
        if(!d_user) return res.status(404).json({ success: false, message: "Could not find user"})
        
        d_user.send("I see you've started playing! How about you start a session using `/start`!")
    })

    return {
        method: "POST",
        route: "/start"
    }
}