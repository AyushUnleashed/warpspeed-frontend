"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Video, Edit, Loader2, Upload, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { fetchProducts } from "@/utils/ProductUtils";
import { BackendErrorCard } from "@/components/utility/ErrorCards";

/**
 * Products Page Component
 * 
 * Main page that displays user's products and allows creation of new products
 * and video generation.
 */
export default function ProductsPage() {
  // ========== STATE MANAGEMENT ==========
  const [products, setProducts] = useState<Product[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  
  // Modal form state
  const [productType, setProductType] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState<{productType?: string}>({});

  const router = useRouter();

  // ========== DATA FETCHING ==========
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts();
        setProducts(productList);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ========== DRAG & DROP HANDLERS ==========
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clear URL input when file is uploaded
    setProductImageUrl("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeUploadedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  // ========== EVENT HANDLERS ==========
  const handleAddProduct = () => {
    setShowCreateProductModal(true);
    // Reset form state
    setProductType("");
    setProductImageUrl("");
    setUploadedFile(null);
    setPreviewUrl(null);
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowCreateProductModal(false);
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Reset form state
    setProductType("");
    setProductImageUrl("");
    setUploadedFile(null);
    setPreviewUrl(null);
    setFormErrors({});
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: {productType?: string} = {};
    if (!productType.trim()) {
      errors.productType = "Product type is required";
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // TODO: Implement actual product creation logic
    console.log("Creating product:", {
      type: productType,
      imageUrl: productImageUrl,
      uploadedFile: uploadedFile
    });
    
    // Close modal after creation
    handleCloseModal();
  };

  const handleGenerateVideo = (productId: string) => {
    // Call the shared function
    // createVideoProject(productId, router);
    console.log("Generate video for product:", productId);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/products/edit-product/${productId}`);
  };

  // ========== COMPONENTS ==========
  const LoadingState = () => (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
      <div className="bg-blue-50 rounded-full p-5 mb-4">
        <Plus className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Add a product to get started</h2>
      <p className="text-gray-600 mb-6">
        We need product details to generate great videos for you.
      </p>
      
      <Button 
        size="lg" 
        onClick={handleAddProduct} 
        className="gap-2"
      >
        Create Product <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  const AddProductCard = () => (
    <Card
      className="group relative hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gradient-to-br from-blue-50 to-white border-dashed border-2 border-blue-200"
      onClick={handleAddProduct}
    >
      <CardContent className="flex flex-col items-center justify-center h-48 p-4">
        <Plus className="w-10 h-10 text-primary mb-2" />
        <p className="text-center text-primary font-medium">Add New Product</p>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        Create another product for your video content
      </CardFooter>
    </Card>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group relative hover:shadow-md transition-shadow duration-200">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            handleEditProduct(product.id);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-0 relative">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
            <span className="text-gray-500">No product image</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-3 pb-4 px-4">
        <div className="w-full flex justify-between items-center mb-3">
          <span className="font-semibold text-lg truncate">{product.name}</span>
        </div>
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => handleGenerateVideo(product.id)}
        >
          <Video className="w-4 h-4 mr-2" />
          Start Video Generation
        </Button>
      </CardFooter>
    </Card>
  );

  const ProductsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AddProductCard />
      
      {products && products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  // ========== DRAG & DROP UPLOAD COMPONENT ==========
  const ImageUploadArea = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Image
      </label>
      
      {/* Show preview if file is uploaded */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={removeUploadedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Drag & Drop Area or URL Input */}
      {!previewUrl && (
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="text-center">
              <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="mt-4">
                <p className="text-sm font-medium">
                  {isDragOver ? 'Drop your image here' : 'Drag and drop your product image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          </div>
          
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInputChange}
          />
          
          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image URL
            </label>
            <input
              type="url"
              value={productImageUrl}
              onChange={(e) => setProductImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/product-image.jpg"
            />
          </div>
        </div>
      )}
    </div>
  );

  // ========== MAIN RENDER ==========
  if (isLoading) {
    return <LoadingState />;
  }

  if (products === null) {
    return <BackendErrorCard />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {products.length === 0 ? <EmptyState /> : <ProductsGrid />}

      {/* Create Product Modal */}
      {showCreateProductModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create Product</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleCreateProduct} className="space-y-6">
                {/* Image Upload Area */}
                <ImageUploadArea />
                
                {/* Product Type Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.productType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Perfume, Skincare, Electronics"
                    required
                  />
                  {formErrors.productType && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.productType}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="default"
                  >
                    Create Product
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}