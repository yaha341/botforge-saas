export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Prodamus
  prodamusShopUrl: process.env.PRODAMUS_SHOP_URL ?? "",
  prodamusSecretKey: process.env.PRODAMUS_SECRET_KEY ?? "",
  // Zernio (Instagram)
  zernioApiKey: process.env.ZERNIO_API_KEY ?? "",
  // Public URL
  publicUrl: process.env.APP_PUBLIC_URL ?? "https://botforge-saas.vercel.app",
};
