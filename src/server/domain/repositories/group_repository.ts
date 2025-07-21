import type {
  CreateGroupRequest,
  Group,
  UpdateGroupRequest,
} from "@/lib/schemas";

export interface GroupRepository {
  findById(id: number): Promise<Group | null>;
  findByCreatedBy(createdBy: number): Promise<Group[]>;
  findActiveGroups(): Promise<Group[]>;
  create(group: CreateGroupRequest): Promise<Group>;
  update(id: number, group: UpdateGroupRequest): Promise<Group | null>;
  softDelete(id: number): Promise<boolean>;
  findAll(): Promise<Group[]>;
}
