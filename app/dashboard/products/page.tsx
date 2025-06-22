"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Video, Edit, Loader2, Upload, X, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { fetchProducts, createProduct, removeBackground, createProject, generatePrompts, generateDesign } from "@/utils/api";
import { BackendErrorCard } from "@/components/utility/ErrorCards";

interface ProcessingStage {
  stage: 'creating' | 'removing-bg' | 'generating-prompts' | 'generating-designs' | 'complete';
  message: string;
}

export default function ProductsPage() {
  // ========== STATE MANAGEMENT ==========
  const [products, setProducts] = useState<Product[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>({
    stage: 'creating',
    message: 'Creating product...'
  });
  
  // Modal form state
  const [productType, setProductType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState<{productType?: string, file?: string}>({});
  const [isCreating, setIsCreating] = useState(false);

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
    
    // Clear file error
    setFormErrors(prev => ({ ...prev, file: undefined }));
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
    setUploadedFile(null);
    setPreviewUrl(null);
    setFormErrors({});
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: {productType?: string, file?: string} = {};
    if (!productType.trim()) {
      errors.productType = "Product type is required";
    }
    if (!uploadedFile) {
      errors.file = "Product image is required";
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsCreating(true);
    setShowProcessingModal(true);
    setProcessingStage({ stage: 'creating', message: 'Creating product...' });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile!);
      formData.append('product_type', productType);

      // Step 1: Create product
      const newProduct = await createProduct(formData);
      if (!newProduct) throw new Error("Failed to create product");

      // Step 2: Remove background
      setProcessingStage({ stage: 'removing-bg', message: 'Removing background...' });
      const updatedProduct = await removeBackground(newProduct.id);
      if (!updatedProduct) throw new Error("Failed to remove background");

      // Update products list
      setProducts(prev => prev ? [updatedProduct, ...prev] : [updatedProduct]);
      
      // Close modals and reset form
      setShowCreateProductModal(false);
      setShowProcessingModal(false);
      handleCloseModal();
      
    } catch (error) {
      console.error("Error creating product:", error);
      setShowProcessingModal(false);
      // Show error to user
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateVideo = async (product: Product) => {
    setShowProcessingModal(true);
    setProcessingStage({ stage: 'creating', message: 'Initializing AI generation...' });

    try {
      // Step 1: Create project
      const project = await createProject(product.id);
      if (!project) throw new Error("Failed to create project");

      // Step 2: Generate prompts
      setProcessingStage({ stage: 'generating-prompts', message: 'Generating creative prompts...' });
      const prompts = await generatePrompts(
        project.id, 
        product.product_image_bg_removed_url, 
        product.product_type
      );

      // Step 3: Generate designs in parallel
      setProcessingStage({ stage: 'generating-designs', message: `Generating ${prompts.length} designs...` });
      const designPromises = prompts.map(prompt => generateDesign(project.id, prompt));
      const designUrls = await Promise.all(designPromises);

      setProcessingStage({ stage: 'complete', message: 'Generation complete! Redirecting...' });

      // Navigate to chat interface with project data
      setTimeout(() => {
        setShowProcessingModal(false);
        router.push(`/dashboard/ai-chat?projectId=${project.id}&images=${encodeURIComponent(JSON.stringify(designUrls))}`);
      }, 1000);

    } catch (error) {
      console.error("Error generating AI content:", error);
      setShowProcessingModal(false);
      // Show error to user
    }
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
        Upload your product images and let AI create stunning photography.
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
        Create stunning AI photography
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
        {product.product_image_bg_removed_url || product.product_image_url ? (
          <Image
            src={product.product_image_bg_removed_url || product.product_image_url}
            alt={product.product_type}
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
          <span className="font-semibold text-lg truncate">{product.product_type}</span>
        </div>
        <Button 
          variant="default" 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => handleGenerateVideo(product)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
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

  // Processing Modal
  const ProcessingModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Processing</h3>
          <p className="text-gray-600 mb-4">{processingStage.message}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: processingStage.stage === 'creating' ? '25%' :
                       processingStage.stage === 'removing-bg' ? '50%' :
                       processingStage.stage === 'generating-prompts' ? '75%' :
                       processingStage.stage === 'generating-designs' ? '90%' : '100%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ========== DRAG & DROP UPLOAD COMPONENT ==========
  const ImageUploadArea = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Image <span className="text-red-500">*</span>
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
      
      {/* Drag & Drop Area */}
      {!previewUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : formErrors.file 
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${
              isDragOver ? 'text-blue-500' : 
              formErrors.file ? 'text-red-500' : 'text-gray-400'
            }`} />
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
      )}
      
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
      />
      
      {formErrors.file && (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {formErrors.file}
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
                  disabled={isCreating}
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
                    disabled={isCreating}
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
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="default"
                    disabled={isCreating}
                    className="gap-2"
                  >
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Product
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {showProcessingModal && <ProcessingModal />}
    </div>
  );
}