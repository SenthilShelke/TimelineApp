import { apiRequest } from "./client";
import type { Timeline } from "./types";

// Payload the app sends when creating/updating a timeline.
export type TimelineEventInput = {
  id?: string;
  title: string;
  date: string;
  description?: string;
  images?: string[];
};

export type TimelineInput = {
  title: string;
  events: TimelineEventInput[];
};

export function listTimelines(): Promise<Timeline[]> {
  return apiRequest<Timeline[]>("/timelines");
}

export function getTimeline(id: string): Promise<Timeline> {
  return apiRequest<Timeline>(`/timelines/${id}`);
}

export function createTimeline(input: TimelineInput): Promise<Timeline> {
  return apiRequest<Timeline>("/timelines", { method: "POST", body: input });
}

export function updateTimeline(id: string, input: TimelineInput): Promise<Timeline> {
  return apiRequest<Timeline>(`/timelines/${id}`, { method: "PUT", body: input });
}

export function deleteTimeline(id: string): Promise<void> {
  return apiRequest<void>(`/timelines/${id}`, { method: "DELETE" });
}
