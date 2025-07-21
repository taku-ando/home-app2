export interface Group {
  id: number;
  name: string;
  createdBy: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupRequest {
  name: string;
  createdBy: number;
}

export interface UpdateGroupRequest {
  name?: string;
}
