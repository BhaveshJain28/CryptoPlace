const axios = require('axios');
const CG_Base = process.env.COINGECKO_BASE_URL;

const coingeckoApi = axios.create({
    baseURL: CG_Base,
    headers:process.env.CG_API_KEY ? { 'x-cg-demo-api-key' :process.env.CG_API_KEY} :{}
});
module.exports = coingeckoApi;
