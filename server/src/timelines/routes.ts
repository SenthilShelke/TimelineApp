import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth/requireAuth.js";

export const timelinesRouter = Router();

// Every route requires a valid app JWT (password or Google login — doesn't matter).
timelinesRouter.use(requireAuth);

// ---- Validation --------------------------------------------------------------

const eventSchema = z.object({
  id: z.string().uuid().optional(), // present = existing event to update
  title: z.string().min(1),
  // Accept an ISO datetime or a plain YYYY-MM-DD date.
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date"),
  description: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
});

const timelineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  events: z.array(eventSchema).optional().default([]),
});

// ---- Serialization -----------------------------------------------------------
// Shape the API returns so it matches the app's existing `{ id, title, events[] }`.

function serializeTimeline(t: {
  id: string;
  title: string;
  events: {
    id: string;
    title: string;
    eventDate: Date;
    description: string | null;
    position: number | null;
    images: { url: string; position: number | null }[];
  }[];
}) {
  return {
    id: t.id,
    title: t.title,
    events: t.events
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.eventDate.toISOString(),
        description: e.description ?? "",
        images: e.images
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((img) => img.url),
      })),
  };
}

const timelineInclude = { events: { include: { images: true } } } as const;

// ---- Routes ------------------------------------------------------------------

// GET /timelines  -> all timelines for the logged-in user (with nested events)
timelinesRouter.get("/", async (req, res) => {
  const timelines = await prisma.timeline.findMany({
    where: { userId: req.userId! },
    include: timelineInclude,
    orderBy: { createdAt: "asc" },
  });
  res.json(timelines.map(serializeTimeline));
});

// GET /timelines/:id  -> a single timeline you own
timelinesRouter.get("/:id", async (req, res) => {
  const timeline = await prisma.timeline.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: timelineInclude,
  });
  if (!timeline) return res.status(404).json({ error: "Timeline not found" });
  res.json(serializeTimeline(timeline));
});

// POST /timelines  { title, events? }  -> create
timelinesRouter.post("/", async (req, res) => {
  const parsed = timelineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { title, events } = parsed.data;

  const timeline = await prisma.timeline.create({
    data: {
      userId: req.userId!,
      title,
      events: {
        create: events.map((e, i) => ({
          title: e.title,
          eventDate: new Date(e.date),
          description: e.description,
          position: i,
          images: { create: e.images.map((url, j) => ({ url, position: j })) },
        })),
      },
    },
    include: timelineInclude,
  });
  res.status(201).json(serializeTimeline(timeline));
});

// PUT /timelines/:id  { title, events }  -> update title + replace events
// Event sync is done inside a transaction so the timeline never ends up partial.
timelinesRouter.put("/:id", async (req, res) => {
  const parsed = timelineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { title, events } = parsed.data;
  const { id } = req.params;

  // Ownership check first.
  const owned = await prisma.timeline.findFirst({
    where: { id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) return res.status(404).json({ error: "Timeline not found" });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.timeline.update({ where: { id }, data: { title } });

    // Simplest correct sync: clear existing events and recreate from the payload.
    // (Cascade removes their images too.)
    await tx.event.deleteMany({ where: { timelineId: id } });

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      await tx.event.create({
        data: {
          timelineId: id,
          title: e.title,
          eventDate: new Date(e.date),
          description: e.description,
          position: i,
          images: { create: e.images.map((url, j) => ({ url, position: j })) },
        },
      });
    }

    return tx.timeline.findUniqueOrThrow({ where: { id }, include: timelineInclude });
  });

  res.json(serializeTimeline(updated));
});

// DELETE /timelines/:id  -> delete (events/images cascade)
timelinesRouter.delete("/:id", async (req, res) => {
  const owned = await prisma.timeline.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) return res.status(404).json({ error: "Timeline not found" });

  await prisma.timeline.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
