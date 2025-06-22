// app/dashboard/projects/page.tsx - This file should replace the empty one
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, FolderOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project, Design } from "@/types";
import { fetchProjects } from "@/utils/api";
import { BackendErrorCard } from "@/components/utility/ErrorCards";

export default function ProjectsPage() {
  const router = useRouter();
  
  // State management
  const [projects, setProjects] = useState<Project[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await fetchProjects();
        setProjects(projectList);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Navigate to products if no projects
  const handleGoToProducts = () => {
    router.push('/dashboard/products');
  };

  // View project details
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
  };

  // Loading state
  const LoadingState = () => (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
      <div className="bg-gray-50 rounded-full p-8 mb-6">
        <FolderOpen className="h-16 w-16 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4">No Projects Yet</h2>
      <p className="text-gray-600 mb-8 text-lg">
        Create your first product and generate AI photography to get started with projects.
      </p>
      
      <Button 
        size="lg" 
        onClick={handleGoToProducts} 
        className="gap-2"
      >
        <Plus className="h-5 w-5" />
        Go to Products
      </Button>
    </div>
  );

  // Project grid component
  const ProjectGrid = () => (
    <div className="space-y-8">
      {projects && projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  // Individual project card
  const ProjectCard = ({ project }: { project: Project }) => {
    // Parse design versions - assuming they're stored as JSON strings or URLs
    const designVersions = project.design_versions || [];
    
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Project {project.id.slice(-8)}</CardTitle>
            <p className="text-sm text-gray-500">
              {designVersions.length} design{designVersions.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewProject(project)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </CardHeader>
        
        <CardContent>
          {designVersions.length > 0 ? (
            <div className="space-y-4">
              {/* Grid layout: left to right is design versions, top to bottom is parent designs */}
              {designVersions.map((designData, designIndex) => (
                <DesignRow 
                  key={designIndex} 
                  designData={designData} 
                  designIndex={designIndex}
                  projectId={project.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No designs generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Design row component - each row represents one parent design with its versions
  const DesignRow = ({ 
    designData, 
    designIndex, 
    projectId 
  }: { 
    designData: string; 
    designIndex: number;
    projectId: string;
  }) => {
    // If designData is a URL, treat it as a single version
    // If it's JSON, parse it to get multiple versions
    let versions: string[] = [];
    
    try {
      // Try to parse as JSON first (in case it contains multiple versions)
      const parsed = JSON.parse(designData);
      if (Array.isArray(parsed)) {
        versions = parsed;
      } else {
        versions = [designData];
      }
    } catch {
      // If not JSON, treat as single URL
      versions = [designData];
    }

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Design {designIndex + 1}</h4>
          <span className="text-xs text-gray-500">
            {versions.length} version{versions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Horizontal scrollable versions */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {versions.map((versionUrl, versionIndex) => (
            <div 
              key={versionIndex}
              className="flex-shrink-0 relative group cursor-pointer"
              onClick={() => {
                // Navigate to AI chat with this specific image
                router.push(`/dashboard/ai-chat?projectId=${projectId}&images=${encodeURIComponent(JSON.stringify([versionUrl]))}`);
              }}
            >
              <div className="w-32 h-24 relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                <Image
                  src={versionUrl}
                  alt={`Design ${designIndex + 1} - Version ${versionIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">
                v{versionIndex + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Project details modal (if needed)
  const ProjectDetailsModal = () => {
    if (!selectedProject) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Project Details</h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedProject(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Project ID</h3>
                <p className="text-gray-600">{selectedProject.id}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Product ID</h3>
                <p className="text-gray-600">{selectedProject.product_id}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Generated Designs</h3>
                <p className="text-gray-600">
                  {selectedProject.design_versions.length} design{selectedProject.design_versions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Prompts Used</h3>
                <div className="space-y-2 mt-2">
                  {selectedProject.prompt_urls.map((prompt, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (isLoading) {
    return <LoadingState />;
  }

  if (projects === null) {
    return <BackendErrorCard />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-gray-600">
            View and manage your AI-generated product photography projects
          </p>
        </div>
        
        <Button onClick={handleGoToProducts} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
      
      {projects.length === 0 ? <EmptyState /> : <ProjectGrid />}
      
      {/* Project Details Modal */}
      <ProjectDetailsModal />
    </div>
  );
}