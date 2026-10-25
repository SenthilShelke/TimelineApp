import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean slate for repeatable seeding
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // A user who signs in with email/password:
  // - one `users` row (profile only)
  // - one `auth_identities` row (provider="password", bcrypt hash in secret)
  // - a sample timeline with two events
  const user = await prisma.user.create({
    data: {
      email: "demo@timelineapp.dev",
      displayName: "Demo User",
      emailVerified: true,
      identities: {
        create: {
          provider: "password",
          providerUserId: "demo@timelineapp.dev",
          secret: passwordHash,
        },
      },
      timelines: {
        create: {
          title: "My First Timeline",
          events: {
            create: [
              {
                title: "Started the project",
                eventDate: new Date("2026-01-15"),
                description: "Kicked things off.",
                position: 0,
              },
              {
                title: "Migrated to Postgres",
                eventDate: new Date("2026-03-01"),
                description: "Added a real backend + database.",
                position: 1,
              },
            ],
          },
        },
      },
    },
    include: {
      identities: true,
      timelines: { include: { events: true } },
    },
  });

  console.log("Seeded user:", user.email);
  console.log("  identities:", user.identities.map((i) => i.provider));
  console.log("  timelines :", user.timelines.map((t) => `${t.title} (${t.events.length} events)`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
