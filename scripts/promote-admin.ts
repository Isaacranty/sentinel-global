import { prisma } from "../lib/prisma";

async function promote() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email: npm run admin:promote -- your-email@example.com");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { role: "admin" }
    });
    console.log(`Success: ${user.name} (${user.email}) is now an admin.`);
  } catch (err) {
    console.error(`Error: User with email "${email}" not found.`);
  } finally {
    await prisma.$disconnect();
  }
}

promote();
