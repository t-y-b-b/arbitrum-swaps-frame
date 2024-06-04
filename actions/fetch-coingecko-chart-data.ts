const options = {
  method: "GET",
  headers: {
    "x-cg-pro-api-key": process.env.API_KEY_COINGECKO!,
  },
};

export const fetchCoingeckoTopPoolsByTokenAddress = async (
  network: string,
  tokenAddress: string
) => {
  const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/tokens/${tokenAddress}/pools`;

  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((res) => res.data[0].attributes.address);

  return data;
};

export const fetchCoingeckoChartDataByPoolAddress = async (
  network: string,
  poolAddress: string,
  timeframe: string = "hour"
) => {
  const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}`;
  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((res) => res.data)
    .then((res) => res.attributes["ohlcv_list"]);

  return data.reverse();
};
