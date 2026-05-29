import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting prisma database seeding...");

  // 1. Clean existing data safely in sequence
  const tables = ["notification", "settlement", "split", "expense", "groupMember", "group", "user"];
  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany();
    } catch (err) {
      console.warn(`Table cleanup skipped for: ${table}`);
    }
  }

  // 2. Create the default admin credential profile
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@matttrip.com",
      password: "Matt@4321admin",
      role: Role.ADMIN
    }
  });

  console.log("Successfully seeded administrative credentials:", admin.email);
}

main()
  .catch((e) => {
    console.error("Seeder failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
