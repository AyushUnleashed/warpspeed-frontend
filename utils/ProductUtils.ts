import { baseHeaders } from "@/utils/utils";
import type { Product } from "@/types";

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

/**
 * Fetches all products belonging to the current user
 * 
 * @param jwtToken - JWT token for authorization
 * @returns A promise that resolves to an array of products or null in case of error
 */
export async function fetchProducts(jwtToken: string | null): Promise<Product[] | null> {
  if (!jwtToken) {
    console.error("No JWT token available");
    return null;
  }
  
  try {
    const response = await fetch(
      `${backendBaseUrl}/api/products/get-all-products`,
      {
        headers: {
          ...baseHeaders,
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}