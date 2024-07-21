const db = require("../modules/db")

module.exports = (app) => {
    app.post("/start", async (req, res) => {
        const { body } = req
        if(!body || body.ruid == undefined) return res.status(400).json({ success: false, message: "RUID not provided" })
        await db.client.connect()   
        const user = await db.collections.users.findOne({ ruid: parseInt(body.ruid) })
        await db.client.close()
        if(!user) { 
            console.log("Request failed on registration check") 
            return res.status(404).json({ success: false, message: "User not found or not registered" }) 
        }

        const d_user = await app.client.users.cache.find(id => id.id === user.uid)
        if(d_user == undefined){ 
            console.log(`Request failed on d_user check, uid was ${user.uid}`)
            return res.status(404).json({ success: false, message: "Could not find user"}) 
        }

        await db.client.connect()
        const session = await db.collections.threads.findOne({ uid: user.uid, active: true })
        if(session){
            console.log("Request failed on thread check")
            return res.status(400).json({ success: false, message: "User is already in a session" })
        }
        await db.client.close()

        d_user.send("I see you've started playing! How about you start a session using `/start`!")
    })

    return {
        method: "POST",
        route: "/start"
    }
}