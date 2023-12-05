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
  res.send("RYWProxy Running");
});

async function proceedRequest(req: any, res: any, fixedURL?: string) {
  const response: any = {};

  let databack = "";

  try {
    const originRes = await axiod.request({
      url: fixedURL ? fixedURL : `https://rayongwit.ac.th${req.path}`,
      method: req.body.method ?? "GET",
      data: req.body.data ?? undefined,
      headers: {
        "Cookie": req.body.headers?.["Cookie"] ?? "my_lang=th",
        "Content-Type": req.body.headers?.["Content-Type"] ?? "",
        ...config.defaultHeaders,
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

// Handle Static assets
app.get("/serve/*", async (req: any, res: any) => {
  const destPath = req.path.replace("/serve", "");

  try {
    const originRes = await axiod.request({
      url: `https://rayongwit.ac.th${destPath}`,
      method: "GET",
      headers: config.defaultHeaders,
      responseType: "arraybuffer",
    });

    res.writeHead(200, [[
      "Content-Type",
      originRes.headers.get("Content-Type"),
    ]]);
    res.end(new Uint8Array(originRes.data));
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

// Handle Watpol subdomains
app.post("/watpol", async (req: any, res: any) => {
  if (!req.query["server"]) {
    res.status(400);
    res.send("Missing Server");
    return;
  }

  if (!config.watpolServers[req.query.server]) {
    res.status(404);
    res.send("Invalid Server Index");
    return;
  }

  proceedRequest(req, res, config.watpolServers[req.query.server]);
});

app.post("*", async (req: any, res: any) => {
  proceedRequest(req, res);
});

app.listen(port, () => {
  console.log(`RYWProxy listening at http://localhost:${port}`);
});
