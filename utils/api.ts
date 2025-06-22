// utils/api.ts
import { baseHeaders } from "@/utils/utils";
import type { Product, Project, Design } from "@/types";

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

// Product APIs
export async function createProduct(formData: FormData): Promise<Product | null> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/products/create`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to create product");
    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function removeBackground(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/products/remove-background`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) throw new Error("Failed to remove background");
    return await response.json();
  } catch (error) {
    console.error("Error removing background:", error);
    throw error;
  }
}

export async function fetchProducts(): Promise<Product[] | null> {
  try {
    const response = await fetch(
      `${backendBaseUrl}/api/products/get-all-products`,
      {
        headers: {
          ...baseHeaders,
        },
      }
    );
    
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

// Project APIs
export async function generatePrompts(projectId: string, productImageUrl: string, productType: string): Promise<string[]> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/projects/generate-prompts`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
      },
      body: JSON.stringify({
        project_id: projectId,
        product_image_url: productImageUrl,
        product_type: productType,
      }),
    });

    if (!response.ok) throw new Error("Failed to generate prompts");
    const data = await response.json();
    return data.prompts || [];
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
}

export async function generateDesign(projectId: string, imagePrompt: string): Promise<string> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/projects/generate-design`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
      },
      body: JSON.stringify({
        project_id: projectId,
        image_prompt: imagePrompt,
      }),
    });

    if (!response.ok) throw new Error("Failed to generate design");
    const data = await response.json();
    return data.image_url;
  } catch (error) {
    console.error("Error generating design:", error);
    throw error;
  }
}

export async function createProject(productId: string): Promise<Project | null> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/projects/create`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) throw new Error("Failed to create project");
    return await response.json();
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function fetchProjects(): Promise<Project[] | null> {
  try {
    const response = await fetch(
      `${backendBaseUrl}/api/projects/get-all-projects`,
      {
        headers: {
          ...baseHeaders,
        },
      }
    );
    
    if (!response.ok) throw new Error("Failed to fetch projects");
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

// Design APIs
export async function editImage(designId: string, editPrompt: string, baseImageUrl: string): Promise<string> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/designs/edit-image`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
      },
      body: JSON.stringify({
        design_id: designId,
        edit_prompt: editPrompt,
        base_image_url: baseImageUrl,
      }),
    });

    if (!response.ok) throw new Error("Failed to edit image");
    const data = await response.json();
    return data.image_url;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}