const axios = require("axios");

function resolveUrl(baseUrl, endpoint) {
  if (!endpoint) {
    throw new Error("Missing Daraja endpoint configuration.");
  }

  try {
    return new URL(endpoint).toString();
  } catch {
    if (!baseUrl) {
      throw new Error("Missing DARAJA_BASE_URL for relative endpoints.");
    }
    return new URL(endpoint, baseUrl).toString();
  }
}

function getConfig(overrides = {}) {
  const env = (overrides.environment || process.env.MPESA_ENV || "sandbox").toLowerCase();
  const isProd = env === "production" || env === "prod";

  const baseUrl =
    overrides.baseUrl ||
    (isProd
      ? process.env.MPESA_PROD_BASE_URL
      : process.env.MPESA_SANDBOX_BASE_URL || process.env.MPESA_BASE_URL);

  const consumerKey =
    overrides.consumerKey ||
    (isProd
      ? process.env.MPESA_PROD_CONSUMER_KEY
      : process.env.MPESA_SANDBOX_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY);

  const consumerSecret =
    overrides.consumerSecret ||
    (isProd
      ? process.env.MPESA_PROD_CONSUMER_SECRET
      : process.env.MPESA_SANDBOX_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET);
  return {
    environment: env,
    baseUrl,
    consumerKey,
    consumerSecret,
    oauthEndpoint:
      overrides.oauthEndpoint || process.env.MPESA_OAUTH_ENDPOINT || "/oauth/v1/generate?grant_type=client_credentials",
    stkPushEndpoint:
      overrides.stkPushEndpoint || process.env.MPESA_STK_PUSH_ENDPOINT,
    b2cEndpoint: overrides.b2cEndpoint || process.env.MPESA_B2C_ENDPOINT,
    b2bEndpoint: overrides.b2bEndpoint || process.env.MPESA_B2B_ENDPOINT,
    transactionStatusEndpoint:
      overrides.transactionStatusEndpoint || process.env.MPESA_TRANSACTION_STATUS_ENDPOINT,
    accountBalanceEndpoint:
      overrides.accountBalanceEndpoint || process.env.MPESA_ACCOUNT_BALANCE_ENDPOINT,
    reversalEndpoint: overrides.reversalEndpoint || process.env.MPESA_REVERSAL_ENDPOINT,
    qrCodeEndpoint: overrides.qrCodeEndpoint || process.env.MPESA_QR_CODE_ENDPOINT,
    ratibaEndpoint: overrides.ratibaEndpoint || process.env.MPESA_RATIBA_ENDPOINT,
    pullTransactionsEndpoint:
      overrides.pullTransactionsEndpoint || process.env.MPESA_PULL_TRANSACTIONS_ENDPOINT,
  };
}

function requireValue(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
}

async function getAccessToken(config) {
  requireValue("DARAJA_CONSUMER_KEY", config.consumerKey);
  requireValue("DARAJA_CONSUMER_SECRET", config.consumerSecret);

  const url = resolveUrl(config.baseUrl, config.oauthEndpoint);
  const response = await axios.get(url, {
    auth: {
      username: config.consumerKey,
      password: config.consumerSecret,
    },
  });

  return response.data.access_token || response.data.accessToken;
}

async function postWithAuth(endpoint, payload, overrides) {
  const config = getConfig(overrides);
  const token = await getAccessToken(config);
  const url = resolveUrl(config.baseUrl, endpoint);

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

function createDarajaService(overrides = {}) {
  return {
    stkPushC2B: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).stkPushEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    b2c: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).b2cEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    b2b: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).b2bEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    transactionStatusQuery: (payload, callOverrides) =>
      postWithAuth(
        getConfig({ ...overrides, ...callOverrides }).transactionStatusEndpoint,
        payload,
        { ...overrides, ...callOverrides }
      ),
    accountBalance: (payload, callOverrides) =>
      postWithAuth(
        getConfig({ ...overrides, ...callOverrides }).accountBalanceEndpoint,
        payload,
        { ...overrides, ...callOverrides }
      ),
    reversal: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).reversalEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    qrCode: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).qrCodeEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    ratiba: (payload, callOverrides) =>
      postWithAuth(getConfig({ ...overrides, ...callOverrides }).ratibaEndpoint, payload, {
        ...overrides,
        ...callOverrides,
      }),
    pullTransactions: (payload, callOverrides) =>
      postWithAuth(
        getConfig({ ...overrides, ...callOverrides }).pullTransactionsEndpoint,
        payload,
        { ...overrides, ...callOverrides }
      ),
  };
}

module.exports = {
  createDarajaService,
  getAccessToken,
};
