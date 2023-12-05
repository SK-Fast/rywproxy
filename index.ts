import express from "npm:express";
import config from "./config.ts";
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
const app = express();
const port = Deno.env.get("PORT") || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  next();
});

app.get("/", (req: any, res: any) => {
  res.send("RYWProxy Running")
})

async function proceedRequest(req: any, res: any, fixedURL?: string) {
  const response: any = {};

  let databack = ""

  try {
    const originRes = await axiod.request({
      url: fixedURL ? fixedURL : `https://rayongwit.ac.th${req.path}`,
      method: req.body.method ?? "GET",
      data: req.body.data ?? undefined,
      headers: {
        "Cookie": req.body.headers?.["Cookie"] ?? "my_lang=th",
        "Content-Type": req.body.headers?.["Content-Type"] ?? "",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language":
          "en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7,zh-CN;q=0.6,zh;q=0.5",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    });

    databack = originRes.data;

    const data = originRes.data;

    if (originRes.headers.has("set-cookie")) {
      response["set-cookie"] = originRes.headers.get("set-cookie");
    }

    response["data"] = data;

    res.json(response);
  } catch {
    res.status(500);
    res.send(databack ?? "ERR");
  }
}

// Handle Watpol subdomains
app.post("/watpol", async (req: any, res: any) => {
  if (!req.query['server']) {
    res.status(400);
    res.send("Missing Server");
    return
  }

  if (!config.watpolServers[req.query.server]) {
    res.status(404);
    res.send("Invalid Server Index");
    return
  }

  proceedRequest(req, res, config.watpolServers[req.query.server])
});

app.post("*", async (req: any, res: any) => {
  proceedRequest(req, res)
});

app.listen(port, () => {
  console.log(`RYWProxy listening at http://localhost:${port}`);
});
