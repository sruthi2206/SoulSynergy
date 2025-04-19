import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Loader2, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Link, 
  Check, 
  X 
} from "lucide-react";
import { useLocation } from "wouter";

// Define types for healing ritual
interface HealingRitual {
  id: number;
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
  featuredImage?: string | null;
  videoUrl?: string | null;
  zoomLink?: string | null;
  eventDate?: Date | string | null;
  isFeatured?: boolean;
  status?: string;
}

interface HealingRitualFormData {
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
  featuredImage: string | null;
  videoUrl: string | null;
  zoomLink: string | null;
  eventDate: string | null;
  isFeatured: boolean;
  status: string;
}

interface MediaItem {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize?: number;
  altText?: string;
  uploadedById: number;
  uploadDate: Date;
}

interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}

const CHAKRAS = [
  { value: "root", label: "Root" },
  { value: "sacral", label: "Sacral" },
  { value: "solar_plexus", label: "Solar Plexus" },
  { value: "heart", label: "Heart" },
  { value: "throat", label: "Throat" },
  { value: "third_eye", label: "Third Eye" },
  { value: "crown", label: "Crown" },
];

const EMOTIONS = [
  { value: "anger", label: "Anger" },
  { value: "fear", label: "Fear" },
  { value: "sadness", label: "Sadness" },
  { value: "joy", label: "Joy" },
  { value: "disgust", label: "Disgust" },
  { value: "surprise", label: "Surprise" },
  { value: "anxiety", label: "Anxiety" },
  { value: "guilt", label: "Guilt" },
  { value: "shame", label: "Shame" },
  { value: "confusion", label: "Confusion" },
  { value: "doubt", label: "Doubt" },
  { value: "grief", label: "Grief" },
  { value: "depression", label: "Depression" },
];

const RITUAL_TYPES = [
  { value: "meditation", label: "Meditation" },
  { value: "visualization", label: "Visualization" },
  { value: "sound_healing", label: "Sound Healing" },
  { value: "affirmation", label: "Affirmation" },
  { value: "movement", label: "Movement" },
  { value: "somatic", label: "Somatic Practice" },
  { value: "journaling", label: "Journaling" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "breath_work", label: "Breath Work" },
];

// Drop zone component for file uploads
function DropZone({ 
  onFileDrop, 
  acceptedFileTypes,
  currentFileUrl,
  isUploading
}: { 
  onFileDrop: (file: File) => void;
  acceptedFileTypes: string[];
  currentFileUrl: string | null;
  isUploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (acceptedFileTypes.some(type => file.type.includes(type))) {
        onFileDrop(file);
      } else {
        alert(`Please upload a valid file type: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (acceptedFileTypes.some(type => file.type.includes(type))) {
        onFileDrop(file);
      } else {
        alert(`Please upload a valid file type: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  let icon;
  if (acceptedFileTypes.includes('image')) {
    icon = <ImageIcon className="h-12 w-12 text-muted-foreground" />;
  } else if (acceptedFileTypes.includes('video')) {
    icon = <Video className="h-12 w-12 text-muted-foreground" />;
  } else {
    icon = <Upload className="h-12 w-12 text-muted-foreground" />;
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
      onClick={handleBrowseClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept={acceptedFileTypes.map(type => `.${type}`).join(',')} 
        className="hidden" 
      />
      
      {currentFileUrl ? (
        acceptedFileTypes.includes('image') ? (
          <div className="relative">
            <img 
              src={currentFileUrl} 
              alt="Uploaded file preview" 
              className="max-h-40 max-w-full object-contain rounded-md" 
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <p className="text-white text-xs">Click to change image</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <span>File uploaded. Click to change.</span>
          </div>
        )
      ) : (
        <>
          {icon}
          <div className="text-center">
            {isUploading ? (
              <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
            ) : (
              <>
                <p className="font-medium">Drag & drop file here, or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  {acceptedFileTypes.map(type => type.toUpperCase()).join(', ')} files only
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<HealingRitual | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<HealingRitualFormData>({
    name: "",
    type: "",
    description: "",
    instructions: "",
    targetChakra: null,
    targetEmotion: null,
    featuredImage: null,
    videoUrl: null,
    zoomLink: null,
    eventDate: null,
    isFeatured: false,
    status: "published"
  });

  // Query to fetch all healing rituals
  const {
    data: rituals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/healing-rituals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/healing-rituals");
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: HealingRitualFormData) => {
      const response = await apiRequest("POST", "/api/healing-rituals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: HealingRitualFormData }) => {
      const response = await apiRequest("PUT", `/api/healing-rituals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/healing-rituals/${id}`);
      return response.status === 204;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!authLoading && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation("/");
    }
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation, toast]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRitual) {
      updateMutation.mutate({ id: editingRitual.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle dropdown changes
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle file upload for images
  const handleFileUpload = async (file: File, fieldName: string) => {
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json() as UploadResponse;
      
      // Update the form data with the file URL
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Upload failed: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      instructions: "",
      targetChakra: null,
      targetEmotion: null,
      featuredImage: null,
      videoUrl: null,
      zoomLink: null,
      eventDate: null,
      isFeatured: false,
      status: "published"
    });
    setEditingRitual(null);
  };

  // Open dialog to edit a ritual
  const handleEdit = (ritual: HealingRitual) => {
    setEditingRitual(ritual);
    setFormData({
      name: ritual.name,
      type: ritual.type,
      description: ritual.description,
      instructions: ritual.instructions,
      targetChakra: ritual.targetChakra,
      targetEmotion: ritual.targetEmotion,
      featuredImage: ritual.featuredImage || null,
      videoUrl: ritual.videoUrl || null,
      zoomLink: ritual.zoomLink || null,
      eventDate: ritual.eventDate ? new Date(ritual.eventDate).toISOString().split('T')[0] : null,
      isFeatured: ritual.isFeatured || false,
      status: ritual.status || "published"
    });
    setIsDialogOpen(true);
  };

  // Confirm deletion of a ritual
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this ritual?")) {
      deleteMutation.mutate(id);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will be redirected by useEffect
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage healing rituals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Ritual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRitual ? "Edit Healing Ritual" : "Create New Healing Ritual"}</DialogTitle>
              <DialogDescription>
                {editingRitual 
                  ? "Update the details of this healing ritual." 
                  : "Enter the details of the new healing ritual."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Basic info tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right">Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange("type", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select ritual type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RITUAL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="targetChakra" className="text-right">Target Chakra</label>
                    <Select 
                      value={formData.targetChakra || ""} 
                      onValueChange={(value) => handleSelectChange("targetChakra", value === "none" ? null : value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select target chakra (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="none-chakra" value="none">None</SelectItem>
                        {CHAKRAS.map(chakra => (
                          <SelectItem key={chakra.value} value={chakra.value}>
                            {chakra.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="targetEmotion" className="text-right">Target Emotion</label>
                    <Select 
                      value={formData.targetEmotion || ""} 
                      onValueChange={(value) => handleSelectChange("targetEmotion", value === "none" ? null : value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select target emotion (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="none-emotion" value="none">None</SelectItem>
                        {EMOTIONS.map(emotion => (
                          <SelectItem key={emotion.value} value={emotion.value}>
                            {emotion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">Description</label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="instructions" className="text-right">Instructions</label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      className="col-span-3"
                      rows={5}
                      required
                    />
                  </div>
                </TabsContent>

                {/* Media tab */}
                <TabsContent value="media" className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Featured Image</h3>
                    <p className="text-muted-foreground text-sm">Upload a featured image for this ritual</p>
                    <DropZone 
                      onFileDrop={(file) => handleFileUpload(file, "featuredImage")}
                      acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                      currentFileUrl={formData.featuredImage}
                      isUploading={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Video URL</h3>
                    <p className="text-muted-foreground text-sm">Enter a URL for an instructional video</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="videoUrl" className="text-right">Video URL</label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        value={formData.videoUrl || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="zoomLink" className="text-right">Zoom Link</label>
                      <Input
                        id="zoomLink"
                        name="zoomLink"
                        value={formData.zoomLink || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="eventDate" className="text-right">Event Date</label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={formData.eventDate || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-1"></div>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Checkbox 
                          id="isFeatured" 
                          checked={formData.isFeatured} 
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("isFeatured", checked === true)
                          }
                        />
                        <label 
                          htmlFor="isFeatured" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Feature this ritual
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="status" className="text-right">Status</label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRitual ? "Update Ritual" : "Create Ritual"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-destructive">
              Error loading healing rituals: {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of all healing rituals</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target Chakra</TableHead>
                <TableHead>Target Emotion</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rituals?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No healing rituals found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rituals?.map((ritual: HealingRitual) => (
                  <TableRow key={ritual.id}>
                    <TableCell className="font-medium">{ritual.name}</TableCell>
                    <TableCell>
                      {RITUAL_TYPES.find(t => t.value === ritual.type)?.label || ritual.type}
                    </TableCell>
                    <TableCell>
                      {ritual.targetChakra 
                        ? CHAKRAS.find(c => c.value === ritual.targetChakra)?.label 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {ritual.targetEmotion 
                        ? EMOTIONS.find(e => e.value === ritual.targetEmotion)?.label 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(ritual)}
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(ritual.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}