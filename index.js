const fetch = require("isomorphic-unfetch");

const MORALIS_API_KEY = "";
const CONTRACT_ADDRESS = "";
const CHAIN = "avalanche";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPage(cursor) {
  let endpoint = `https://deep-index.moralis.io/api/v2/nft/${CONTRACT_ADDRESS}/owners?chain=${CHAIN}&format=decimal`;

  if (cursor) {
    endpoint = `${endpoint}&cursor=${cursor}`;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-API-Key": MORALIS_API_KEY ? MORALIS_API_KEY : "",
    },
  }).then(async (r) => {
    if (r.ok) {
      return {
        ok: true,
        status: r.status,
        json: await r.json(),
      };
    } else {
      return {
        ok: false,
        status: r.status,
        json: await r.text(),
      };
    }
  });

  if (response.ok) {
    return response.json;
  } else {
    console.log("=== ERROR fetching NFT owners ===");
    console.log(response.ok);
    console.log(response.status);
    console.log(response.json);
    return {};
  }
}

(async function () {
  const page = await getPage();

  let results = page.result;
  let cursor = page.cursor;

  if (page.total > page.page_size) {
    while (results.length < page.total) {
      const batch = await getPage(cursor);
      results = [...results, ...batch.result];
      cursor = batch.cursor;
      await sleep(1000); // sleep a tiny bit to avoid pegging the api
    }
  }

  console.log("token_id\towner\ttoken_uri\tmetadata");

  results.forEach((row) => {
    console.log(
      `${row.token_id}\t${row.owner_of}\t${row.token_uri}\t${row.metadata}`
    );
  });
})();
