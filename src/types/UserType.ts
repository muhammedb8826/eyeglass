export type UserType = {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    address: string;
    first_name: string;
    gender: string;
    last_name: string;
    middle_name: string;
    phone: string;
    profile?: string;
    roles: string;
    is_active: boolean;
    /** Optional; not returned by GET /account/me */
    machine_permissions?: unknown[];
    password?: string;
    confirm_password?: string;
};