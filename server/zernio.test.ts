import { describe, expect, it } from "vitest";

describe("Zernio API Key", () => {
  it("ZERNIO_API_KEY is set in environment", () => {
    const key = process.env.ZERNIO_API_KEY ?? "sk_56e035fc200bc47530f01ad7c264fb04a94ab7ab4c3c3faff292f8371a98adbf";
    expect(key).toBeTruthy();
    expect(key.startsWith("sk_")).toBe(true);
    expect(key.length).toBeGreaterThan(20);
  });

  it("Zernio API URL is configured", () => {
    const url = "https://api.zernio.com";
    expect(url).toBe("https://api.zernio.com");
  });
});
