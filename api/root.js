module.exports = (app) => {
    app.get("/", (req, res) => {
        res.send("Kaboom Playtesting Utility is ready")
    })
    return {
        method: "GET",
        route: "/"
    }
}