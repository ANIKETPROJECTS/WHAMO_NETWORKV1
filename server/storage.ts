import { db } from "./db";
import {
  projects,
  type InsertProject,
  type UpdateProjectRequest,
  type ProjectResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<ProjectResponse[]>;
  getProject(id: number): Promise<ProjectResponse | undefined>;
  createProject(project: InsertProject): Promise<ProjectResponse>;
  updateProject(id: number, updates: UpdateProjectRequest): Promise<ProjectResponse>;
  deleteProject(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<ProjectResponse[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<ProjectResponse | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<ProjectResponse> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, updates: UpdateProjectRequest): Promise<ProjectResponse> {
    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}

export const storage = new DatabaseStorage();
