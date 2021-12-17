const hyperionEndpoint = process.env.HYPERION_ENDPOINT || "https://eos.hyperion.eosrio.io";
const querystring = require("querystring");
// import querystring from "querystring";
const delay = ms => new Promise(res => setTimeout(res, ms));
let skip = 0;
const LIMIT = 100;
const delayTimeInMs = process.env.HYPERION_DELAY_PER_FETCH || 10000;
// import fetch from "node-fetch"
const fetch = require("node-fetch");
const timeGapMs = process.env.HYPERION_TIME_GAP || 86400000 * 30 // 1 day
let tries = 0;
let after = new Date((Date.now() - timeGapMs)).toISOString()
let before = new Date().toISOString();
const fs = require('fs');
// var data = fs.readFileSync('data.json');
// var json = JSON.parse(data);
let json = [];

async function run() {
  while (true) {
    let qs = querystring.encode({
      // filter: "ecurve3pool1:withdrawimbl",
      // filter: "ecurve3pool1:withdrawone",
      filter: "ecurve3pool1:withdraw",
      sort: "desc", 
      table: `ipfsentry`,
      skip,
      limit: LIMIT
    });
    qs += `&after=${after}&before=${before}`
    const url = `${hyperionEndpoint}/v2/history/get_actions?${qs}`;
    console.log(`\nafter: ${after} | before: ${before} | url: ${url}`);
    const response = await fetch(url).then((resp) => resp.json());
    await delay(delayTimeInMs);
    const actions = response.actions;
    if(!actions.length) {
      console.log('no actions, moving to next time gap');
      after = Date.parse(new Date(after));
      before = Date.parse(new Date(before));
      after -= timeGapMs;
      before -= timeGapMs;
      after = new Date(after).toISOString();
      before = new Date(before).toISOString();
      skip = 0;
      continue;
    } else {
        json.push(...response.actions);
        console.log(response.actions.legth)
        // fs.writeFile("data_withdrawone.json", JSON.stringify(json),(err) => { 
        fs.writeFile("data_withdraw.json", JSON.stringify(json),(err) => { 
          if (err) { 
            console.log(err); 
          }
        })
    }
    skip += actions.length;

    if (actions.length === 0) break;
  }
  console.log(`Done`);
}

run().catch((error) => {
  console.error(error.stack);
});
