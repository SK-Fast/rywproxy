const express = require('express')
const axios = require("axios").default
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000

app.use(express.text({ type: "*/*" }))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");

    next();
});

app.all('*', async (req, res) => {
    console.log(req.method)
    console.log(req.headers)
    console.log(req.body)
    console.log(req.headers.cookie)

    let databack = ""

    try {
        const originRes = await axios.request({
            url: `https://rayongwit.ac.th${req.path}`,
            method: req.method,
            data: req.body,
            headers: {
                "Cookie": req.headers["cookie"] ?? "",
                "Content-Type": req.headers["content-type"] ?? ""
            }
        })
        
        databack = originRes.data
    
        const data = originRes.data
        let rywlcommands = ""
    
        if (originRes.headers["set-cookie"]) {
            res.setHeader("Set-Cookie", `${originRes.headers["set-cookie"]}; SameSite=None; Secure`)
        }
    
        res.send(`${rywlcommands}${data}`)
    } catch (err) {
        res.status(500)
        res.send(databack ?? "ERR")
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})