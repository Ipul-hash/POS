export interface PermissionItem {
    id: number;
    name: string;
    guard_name: string;
}

export interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
    permissions?: PermissionItem[];
    created_at?: string;
    updated_at?: string;
}

export interface UserAccount {
    id: number;
    name: string;
    email: string;
    pin?: string | null;
    is_active: boolean;
    roles?: RoleItem[];
    created_at: string;
    updated_at: string;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    pin?: string;
    role: string;
    is_active?: boolean;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    pin?: string;
    role?: string;
    is_active?: boolean;
}
