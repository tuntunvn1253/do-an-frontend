export interface UserAddress {
    id: number;
    user_id: number;
    full_name: string;
    phone: string;
    address: string;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}