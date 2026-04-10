import "dotenv/config";

export const CONFIG = {
  PORT: process.env.PORT ? +process.env.PORT : 3000,
  HOST: process.env.DOCKER_IMAGE === 'true' ? '0.0.0.0' : 'localhost',
  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  GHP_TOKEN: process.env.GHP_TOKEN,
  SCANNER_INTERVAL: process.env.SCANNER_INTERVAL ? +process.env.SCANNER_INTERVAL : 60 * 1000, // milliseconds
  SCANNER_REPOS_CHUNK_SIZE: process.env.SCANNER_REPOS_CHUNK_SIZE ? +process.env.SCANNER_REPOS_CHUNK_SIZE : 5,
  EMAIL_SENDING_CHUNK_SIZE: process.env.EMAIL_SENDING_CHUNK_SIZE ? +process.env.EMAIL_SENDING_CHUNK_SIZE : 5,
  API_KEY: process.env.API_KEY,
  API_USE_AUTH: process.env.API_USE_AUTH === 'true',
}

console.log('Configuration loaded:', CONFIG);