import "dotenv/config";

const defaultBaseURL = "https://opensource-demo.orangehrmlive.com";
const configuredBaseURL = process.env.BASE_URL?.trim() || defaultBaseURL;

function validateBaseURL(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`BASE_URL must be an absolute HTTP(S) URL; received "${value}".`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`BASE_URL must use HTTP or HTTPS; received "${value}".`);
  }

  return url.toString().replace(/\/$/, "");
}

export const environment = Object.freeze({
  baseURL: validateBaseURL(configuredBaseURL),
});
