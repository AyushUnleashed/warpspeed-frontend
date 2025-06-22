// types/index.ts
export interface Product {
    id: string;
    product_type: string;
    product_image_url: string; // original image url of product uploaded by user
    product_image_bg_removed_url: string;
    product_extracted_info: string; // detailed description of what image is about
}

export interface Project {
    id: string;
    product_id: string;
    designs: Design[];
    prompt_urls: string[];
}

export interface Design {
    id: string;
    version_image_urls: string[];
}

// Chat message types for AI interface
export interface TextMessage {
    id: string;
    type: 'text';
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export interface ImageGridMessage {
    id: string;
    type: 'image-grid';
    images: string[];
    sender: 'ai';
    timestamp: Date;
    selectedImageIndex?: number;
}

export type ChatMessage = TextMessage | ImageGridMessage;