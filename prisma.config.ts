import "dotenv/config";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

export default {
  datasource: {
    url,
  },
};
