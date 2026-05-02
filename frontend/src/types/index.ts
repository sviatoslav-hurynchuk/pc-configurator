export interface ComponentSpecs {
    [key: string]: string | number;
}

export interface PcComponent {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string;
    power_draw_watts: number;
    specs: ComponentSpecs | null;
    image_url: string | null;
}