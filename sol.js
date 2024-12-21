import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import puppeteer from "puppeteer";
import https from "https";
// import db from './db'
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);
// dayjs.tz.setDefault("Asia/Shanghai");

// console.log(dayjs().tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss"));

// Solana连接
// const connection = new Connection(
//   "https://api.mainnet-beta.solana.com",
//   "confirmed"
// );

const isValidSolanaAddress = (address) => {
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
  return solanaAddressRegex.test(address);
};

const fetchDataByPuppeteer = async (ca) => {
  const url = `https://gmgn.ai/_next/data/BuKFsRDHemPLDNhH-GMOd/sol/token/${ca}.json?chain=sol&token=${ca}`;
  // 启动浏览器
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disabled-setupid-sandbox"],
  });
  const page = await browser.newPage();

  // 设置用户代理（可选）
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );

  // 访问目标网址
  await page.goto(url, { waitUntil: "networkidle2" });

  // 获取页面内容
  const html = await page.content();
  console.log("网页内容:", html); // 打印网页内容

  // 关闭浏览器
  await browser.close();

  try {
    const regex = /<pre>(.*?)<\/pre>/s;
    const match = html.match(regex);
    if (match && match[1]) {
      const jsonString = match[1];

      try {
        // 解析 JSON 数据
        const jsonData = JSON.parse(jsonString);
        return jsonData;
      } catch (error) {
        console.error("JSON 解析错误:", error);
      }
    } else {
      console.log("未找到 JSON 数据");
    }
  } catch (error) {}

  return null;
};

const getTokenInfoByAxios = async (ca) => {
  const url = `https://gmgn.ai/sol/token/${ca}`;
  // 启动浏览器
  const response = await axios.get(
    url
  );
  const html = response.data;

  try {
    const regex =
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s;
    const match = html.match(regex);
    if (match && match[1]) {
      const jsonString = match[1];

      try {
        // 解析 JSON 数据
        const jsonData = JSON.parse(jsonString);
        if (
          jsonData.props &&
          jsonData.props.pageProps &&
          jsonData.props.pageProps.tokenInfo
        ) {
          return jsonData.props.pageProps.tokenInfo;
        }
        return null;
      } catch (error) {
        console.error("JSON 解析错误:", error);
      }
    } else {
      console.log("未找到 JSON 数据");
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

// getTokenInfoByAxios('eL5fUxj2J4CiQsmW85k5FG9DvuQjjUoBHoQBi2Kpump')

const fetchTokenDataByAxios = async (ca) => {
  const url = `https://gmgn.ai/_next/data/BuKFsRDHemPLDNhH-GMOd/sol/token/${ca}.json?chain=sol&token=${ca}`;

  const options = {
    headers: {
      // accept:
      //   "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      // "accept-language": "en,zh-CN;q=0.9,zh-TW;q=0.8,zh;q=0.7",
      // "cache-control": "no-cache",
      // cookie:
      //   "_ga=GA1.1.1458041448.1721781969; cf_clearance=_fI5wdykP2_dEVBBJFSVBP9tcsqwcbiMfVa2Pye.Zss-1734615831-1.2.1.1-J7qVMTFkbk4teIwdMAmaDZyUm2vlOxqx8TAQ5j1Ci1kTfz.jGw46JXkUxlpwLHOqiOTQOeagBsd7MDkSYSfjF8T21Po68y4PE6mQksATC1QouAOe0zgkm0r7288NPm0rLKEFUNyyfZA5yFItauMv3R2TNYhlzcMFZOrhkhPTOCG3u40ke7EXUXenH.HkwKN8o0x1uVeGPKP9CFZq..lrkZH6lIx7CTkjUOMdIaqwwOFNxF_R7Mw4.aMo8mNBBN7r.gDp9epm6Mnm9rwAaq_0v2GZMY3ov5EKIrJzgTNUIM1LSMyCaZ_YebSgadqKYXS7WvoLgPUgHnOFnp9HnCRsXyxkqBBTHKrUBXJEegMelVK6piKLQfixulZjdseBqzT2NiULJd0uYV6DiW.BvvLG0Q; _ga_0XM0LYXGC8=GS1.1.1734615827.25.1.1734615844.0.0.0; __cf_bm=Wk.2mpuIQPPlisCILiJ9YW0E2tnwFq2.18gN6fduAiQ-1734617640-1.0.1.1-FaWl8qmoxkoJrB8pReLWN.NgHr1MhBIqxX63le4t9YLQCJbTgLXlT660_l97V8oc1.WSoSidxADwtPrKaaRMyQ",
      // pragma: "no-cache",
      // priority: "u=0, i",
      // "sec-ch-ua":
      //   '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      // "sec-ch-ua-arch": '"x86"',
      // "sec-ch-ua-bitness": '"64"',
      // "sec-ch-ua-full-version": '"131.0.6778.140"',
      // "sec-ch-ua-full-version-list":
      //   '"Google Chrome";v="131.0.6778.140", "Chromium";v="131.0.6778.140", "Not_A Brand";v="24.0.0.0"',
      // "sec-ch-ua-mobile": "?0",
      // "sec-ch-ua-model": '""',
      // "sec-ch-ua-platform": '"macOS"',
      // "sec-ch-ua-platform-version": '"14.2.1"',
      // "sec-fetch-dest": "document",
      // "sec-fetch-mode": "navigate",
      // "sec-fetch-site": "none",
      // "sec-fetch-user": "?1",
      // "upgrade-insecure-requests": "1",
      // "user-agent":
      //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  };

  try {
    const response = await axios.get(url, options);

    const data = response.data;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching token data:", error);
  }
  return null;
};

/**
 * 
 * @param {*} tokenData 
 * {
      "link": {
        
      },
      "pool_info": {
        
      },
      "chain": "sol",
      "address": "CXLDdeXssf1YcX8W28gsVmZ6GVCSbTabdDLS17hXpump",
      "symbol": "Back",
      "name": "Back",
      "decimals": 6,
      "logo": "https://pump.mypinata.cloud/ipfs/QmXySduoCWJ1zEuyvApjsW38WHsUisis8avgMMtkejrswm",
      "biggest_pool_address": "5R4hV3cJqgZn1bb456aGWLov2rEwkGuH4HMBGPxE3bjy",
      "open_timestamp": 1731908539,
      "holder_count": 325,
      "circulating_supply": "999924343",
      "total_supply": "999924343",
      "max_supply": "999924343",
      "liquidity": "47137.00533646715",
      "creation_timestamp": 1731898002,
      "price": "0.00015680759",
      "price_1m": "0.00015680759",
      "buys_1m": 0,
      "sells_1m": 0,
      "swaps_1m": 0,
      "buy_volume_1m": "0",
      "sell_volume_1m": "0",
      "volume_1m": "0",
      "price_5m": "0.00015754377",
      "buys_5m": 0,
      "sells_5m": 1,
      "swaps_5m": 1,
      "buy_volume_5m": "0",
      "sell_volume_5m": "122.024219767",
      "volume_5m": "122.024219767",
      "price_1h": "0.0001765292",
      "buys_1h": 1,
      "sells_1h": 7,
      "swaps_1h": 8,
      "buy_volume_1h": "89.60046793",
      "sell_volume_1h": "1355.45272339",
      "volume_1h": "1445.053191326",
      "price_6h": "0.00010436762",
      "buys_6h": 74,
      "sells_6h": 69,
      "swaps_6h": 143,
      "buy_volume_6h": "18881.87868092",
      "sell_volume_6h": "14320.98262255",
      "volume_6h": "33202.86130348",
      "price_24h": "0.000078659527",
      "buys_24h": 195,
      "sells_24h": 181,
      "swaps_24h": 376,
      "buy_volume_24h": "41928.4289847",
      "sell_volume_24h": "32821.26863971",
      "volume_24h": "74749.69762441",
      "creator_address": "Hh9aFfGpBrUwwEEYTfRd3X3q18cQWP9BC5EF9c2QhfUW",
      "creator_token_balance": "55528092.5904",
      "creator_token_status": "creator_buy",
      "twitter_name_change_history": [
        
      ],
      "top_10_holder_rate": "0.303871",
      "dexscr_ad": 0,
      "dexscr_update_link": 0,
      "cto_flag": 0,
      "pair_address": "5R4hV3cJqgZn1bb456aGWLov2rEwkGuH4HMBGPxE3bjy",
      "net_in_volume_1m": "",
      "net_in_volume_5m": -122.024219767,
      "net_in_volume_1h": -1265.8522554600002,
      "net_in_volume_6h": 4560.896058369999,
      "net_in_volume_24h": 9107.16034499,
      "market_cap": "156795.72640816337",
      "circulating_market_cap": "156795.72640816337",
      "fdv": "156795.72640816337"
    },
 * @returns 
 */
const parseTokenData = (tokenData) => {
  let arr = [`🎗️币种: ${tokenData.symbol}(${tokenData.name})`];
  arr.push(
    `⏰创建时间: ${dayjs(tokenData.creation_timestamp * 1000)
      .tz("Asia/Shanghai")
      .format("YY-MM-DD HH:mm:ss")}`
  );

  if (tokenData.open_timestamp > 0) {
    arr.push(
      `🕗发射时间: ${dayjs(tokenData.open_timestamp * 1000)
        .tz("Asia/Shanghai")
        .format("YY-MM-DD HH:mm:ss")}`
    );
  } else if (tokenData.launchpad_progress) {
    arr.push(
      `🕗发射时间: ${new BigNumber(tokenData.launchpad_progress)
        .times(100)
        .toFixed(2)}%`
    );
  }

  arr.push(`💰价格: ${tokenData.price}`);
  arr.push(`💹市值: ${formatNumber(tokenData.market_cap)}`);
  // arr.push(`流通市值: ${formatNumber(tokenData.circulating_market_cap)}`);
  // arr.push(`FDV: ${formatNumber(tokenData.fdv)}`);
  // arr.push("\n");
  arr.push(
    `🎅持有人: ${tokenData.holder_count} ${
      tokenData.insider_percentage
        ? `(🐭老鼠仓${new BigNumber(tokenData.insider_percentage)
            .times(100)
            .toFixed(2)}%)`
        : ""
    }`
  );
  arr.push(
    `🔥热度等级: ${tokenData.hot_level || ""} ${
      tokenData.groupCount ? `(${tokenData.groupCount}个群)` : ""
    } ${tokenData.queryCount ? `(${tokenData.queryCount}次查询)` : ""}`
  );
  arr.push(`👶Dev持仓: ${formatNumber(tokenData.creator_token_balance)}`);
  arr.push(
    `🐋Top10持仓: ${new BigNumber(tokenData.top_10_holder_rate)
      .times(100)
      .toFixed(2)}%`
  );
  arr.push(`🛁池子: ${formatNumber(tokenData.liquidity)}`);

  arr.push(`💵1H成交额: ${formatNumber(tokenData.volume_5m)} `);
  arr.push(`💸24H成交额: ${formatNumber(tokenData.volume_24h)} `);

  // arr.push("\n");
  arr.push(
    `⌛️1M: ${percent100(
      tokenData.price_1m,
      tokenData.price
    )}   5M: ${percent100(tokenData.price_5m, tokenData.price)}`
  );
  arr.push(
    `⏳1H: ${percent100(
      tokenData.price_1h,
      tokenData.price
    )}   24H: ${percent100(tokenData.price_24h, tokenData.price)}`
  );

  // arr.push("\n");
  // arr.push("====== 1M ======");
  // arr.push(`Volumn: ${formatNumber(tokenData.volume_1m)} `);
  // arr.push(
  //   `Buy: ${tokenData.buys_1m}/${formatNumber(tokenData.buy_volume_1m)} `
  // );
  // arr.push(
  //   `Sell: ${tokenData.sells_1m}/${formatNumber(tokenData.sell_volume_1m)}`
  // );
  // arr.push(
  //   `Net Buy: ${tokenData.sells_1m}/${formatNumber(tokenData.sell_volume_1m)}`
  // );

  // arr.push("====== 5M ======");
  // arr.push(`Volumn: ${formatNumber(tokenData.volume_5m)} `);
  // arr.push(
  //   `Buy: ${tokenData.buys_5m}/${formatNumber(tokenData.buy_volume_5m)} `
  // );
  // arr.push(
  //   `Sell: ${tokenData.sells_5m}/${formatNumber(tokenData.sell_volume_5m)}`
  // );
  // arr.push(
  //   `Net Buy: ${tokenData.sells_5m}/${formatNumber(tokenData.sell_volume_5m)}`
  // );

  // arr.push("====== 1H ======");
  // arr.push(`Volumn: ${formatNumber(tokenData.volume_1h)} `);
  // arr.push(
  //   `Buy: ${tokenData.buys_1h}/${formatNumber(tokenData.buy_volume_1h)} `
  // );
  // arr.push(
  //   `Sell: ${tokenData.sells_1h}/${formatNumber(tokenData.sell_volume_1h)}`
  // );
  // arr.push(
  //   `Net Buy: ${tokenData.sells_1h}/${formatNumber(tokenData.sell_volume_1h)}`
  // );

  // arr.push("====== 24H ======");
  // arr.push(`Volumn: ${formatNumber(tokenData.volume_24h)} `);
  // arr.push(
  //   `Buy: ${tokenData.buys_24h}/${formatNumber(tokenData.buy_volume_24h)} `
  // );
  // arr.push(
  //   `Sell: ${tokenData.sells_24h}/${formatNumber(tokenData.sell_volume_24h)}`
  // );
  // arr.push(
  //   `Net Buy: ${tokenData.sells_24h}/${formatNumber(tokenData.sell_volume_24h)}`
  // );
  arr.push("\n");
  arr.push(
    `📈查看K线: gmgn.ai/sol/token/FXi8XcLL_${tokenData.address}`
  );
  arr.push(
    `🔰DEV发币记录: pump.fun/profile/${tokenData.creator_address}`
  );
  arr.push("\n");
  arr.push(
    `⌚️查询时间: ${dayjs().tz("Asia/Shanghai").format("YY-MM-DD HH:mm:ss")}`
  );

  return arr.join("\n").replace(/\n\n/g, "\n");
};

const percent100 = (oldPrice, price) => {
  if (!price || !oldPrice) {
    return "0.00%";
  }
  return `${new BigNumber(price)
    .minus(oldPrice)
    .dividedBy(oldPrice)
    .times(100)
    .toFixed(2)}%`;
};

const formatNumber = (value, decimals = 2) => {
  const number = new BigNumber(value);

  if (number.isNaN()) {
    return "Invalid number: value is NaN";
  }

  if (number.isLessThan(1000)) {
    return number.toFixed(decimals); // 小于千的直接返回，保留两位小数
  } else if (number.isLessThan(1e6)) {
    return `${number.dividedBy(1000).toFixed(decimals)}K`; // 千的表示
  } else if (number.isLessThan(1e9)) {
    return `${number.dividedBy(1e6).toFixed(decimals)}M`; // 百万的表示
  } else {
    return `${number.dividedBy(1e9).toFixed(decimals)}B`; // 十亿的表示
  }
};

const getTokenInfo = async (ca) => {
  let data = await fetchDataByPuppeteer(msg);
  let tokenInfo = null;
  if (data) {
    if (data && data.pageProps && data.pageProps.tokenInfo) {
      tokenInfo = data.pageProps.tokenInfo;
    }
  }
  return tokenInfo;
};

/**
   * {
  "code": 0,
  "reason": "",
  "message": "success",
  "data": {
    "smart_degen_count": 0,
    "renowned_count": 0,
    "fresh_wallet_count": 0,
    "dex_bot_count": 0,
    "insider_count": 3,
    "insider_percentage": "0.0273457",
    "following_count": 0
  }
}
 */
const getHolderStatus = async (ca) => {
  let { data } = await axios.get(
    `https://gmgn.ai/api/v1/token_holder_stat/sol/${ca}`
  );
  return data;
};

/**
 * 
{
  "code": 0,
  "reason": "",
  "message": "success",
  "data": {
    "address": "H6yXQSzeqRA91NPWwrDA9hZDihVGFcz9CdKokY3Ppump",
    "launchpad": "Pump.fun",
    "launchpad_status": 0,
    "launchpad_progress": "0.04135357867184283",
    "description": "Most Bullish Farting Duck in Crypto Space! 🐥"
  }
}
 */
const getLaunchpad = async (ca) => {
  let { data } = await axios.get(
    `https://gmgn.ai/api/v1/token_launchpad_info/sol/${ca}`
  );
  return data;
};

const handleSolanaMessage = async (msg) => {
  console.log("获取gmgn数据", msg);
  if (isValidSolanaAddress(msg)) {
    // let data = await fetchDataByPuppeteer(msg);
    let [tokenInfo, data2, data3, data4] = await Promise.all([
      getTokenInfoByAxios(msg),
      fetchHotList(msg),
      getHolderStatus(msg),
      getLaunchpad(msg),
    ]);

    if (tokenInfo) {
      if (data2 && data2.data && data2.data.length) {
        let hot = data2.data[0];
        tokenInfo.groupCount = hot["群数"] + 1;
        tokenInfo.queryCount = hot["次数"] + 1;
      }

      if (data3 && data3.data && data3.data.insider_percentage) {
        tokenInfo.insider_percentage = data3.data.insider_percentage;
      }

      if (data4 && data4.data && data4.data.launchpad_progress) {
        tokenInfo.launchpad_progress = data4.data.launchpad_progress;
      }

      let str = parseTokenData(tokenInfo);
      console.log("===========");
      console.log(str);
      return str;
    }
  }
  return null;
};

const fetchHotList = async (ca, token = "") => {
  const url = `http://suoluosi.net/blockchain/getHotlist?page=1&limit=30&ca=${ca}&token=${token}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en,zh-CN;q=0.9,zh-TW;q=0.8,zh;q=0.7",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Proxy-Connection": "keep-alive",
        Referer: "http://suoluosi.net/blockchain/pump_hot.html",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // 允许不安全的证书
    });

    console.log(response.data); // 输出获取的结果
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return null;
};

// handleSolanaMessage("DLHNY1ViRpqvGy1GrusEt19YXyPqMSUSVpGiS557pump");

// fetchDataByPuppeteer('DLHNY1ViRpqvGy1GrusEt19YXyPqMSUSVpGiS557pump');

// fetchHotList("DLHNY1ViRpqvGy1GrusEt19YXyPqMSUSVpGiS557pump", "");

// getHolderStatus('4Voi1otx7esG6nYzJ7k8FxH6csN7D67MiDpsZzathWhE')

export {
  isValidSolanaAddress,
  fetchTokenDataByAxios,
  parseTokenData,
  formatNumber,
  handleSolanaMessage,
};
