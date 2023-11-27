const express = require('express')
const axios = require("axios").default
const cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 3000

app.use(express.text({ type: "*/*" }))

app.all('*', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");

    console.log("SERVING PROXY")

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
        res.status(502)
        res.send(databack ?? "ERR")
        console.log("FAILURE: ", databack)
        console.log(err)
    }
})

app.listen(port, () => {
    console.log(`RYWProxy listening at http://localhost:${port}`)
})