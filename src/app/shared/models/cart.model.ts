export interface CartItem {
    id: number;
    cart_id: number;
    product_variant_id: number;
    quantity: number;
    variant: any; // We can improve this type later
    created_at?: string;
    updated_at?: string;
}

export interface Cart {
    id: number;
    user_id: number;
    items: CartItem[];
    created_at?: string;
    updated_at?: string;
}
