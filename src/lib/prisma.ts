import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { CONFIG } from "../config";

const adapter = new PrismaPg({ connectionString: CONFIG.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };