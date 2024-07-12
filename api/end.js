module.exports = (app) => {
    app.post("/end", (req, res) => {
        const { body } = req
        if(!body || !body.uid) return;

        
    })
    return {
        method: "POST",
        route: "/end"
    }
}