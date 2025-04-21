import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Search, Edit, Trash2, Image, X, Grid3X3, List, Plus } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Admin Dashboard Main Component
export default function AdminDashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("rituals");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!user) {
      setLocation("/admin");
    }
    // TODO: Add admin role check once implemented
  }, [user, setLocation]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">SoulSync Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar.png" alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/")}>
                  View Site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex container mx-auto py-6 px-4">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <Card className="h-full">
            <CardContent className="p-4">
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant={activeTab === "dashboard" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "rituals" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("rituals")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Healing Rituals
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "events" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("events")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Community Events
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "media" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("media")}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Media Library
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "users" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "settings" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 md:hidden">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="rituals">Rituals</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                  <DashboardOverview />
                </TabsContent>

                <TabsContent value="rituals">
                  <RitualsManager />
                </TabsContent>

                <TabsContent value="events">
                  <EventsManager />
                </TabsContent>

                <TabsContent value="media">
                  <MediaLibrary />
                </TabsContent>

                <TabsContent value="users">
                  <UsersManager />
                </TabsContent>

                <TabsContent value="settings">
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <SettingsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return await res.json();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          totalRituals: 0,
          totalEvents: 0,
          totalMedia: 0
        };
      }
    },
  });

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto" />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Users" value={stats?.totalUsers || 0} icon={<Users className="h-8 w-8" />} />
        <StatCard title="Healing Rituals" value={stats?.totalRituals || 0} icon={<Sparkles className="h-8 w-8" />} />
        <StatCard title="Community Events" value={stats?.totalEvents || 0} icon={<Calendar className="h-8 w-8" />} />
        <StatCard title="Media Files" value={stats?.totalMedia || 0} icon={<Image className="h-8 w-8" />} />
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('add-ritual-button')?.click()}>
          <Plus className="h-6 w-6 mb-2" />
          <span>Add New Ritual</span>
        </Button>
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('add-event-button')?.click()}>
          <Plus className="h-6 w-6 mb-2" />
          <span>Schedule Event</span>
        </Button>
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('upload-media-button')?.click()}>
          <Upload className="h-6 w-6 mb-2" />
          <span>Upload Media</span>
        </Button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Import required icons
import { 
  Calendar, 
  Users, 
  Sparkles, 
  Settings,
  Info,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Clipboard,
  LayoutGrid
} from "lucide-react";

// Media Library Component
function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media items
  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        return await res.json();
      } catch (error) {
        console.error('Error fetching media:', error);
        return [];
      }
    },
  });

  // Delete media item mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/media/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete media');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Media deleted",
        description: "The media has been successfully deleted",
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setUploadedFiles([]);
      setIsUploadDialogOpen(false);
      setIsUploading(false);
      toast({
        title: "Upload successful",
        description: "Your files have been uploaded",
      });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Prevent default drag behaviors
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle file deletion from upload list
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle upload
  const handleUpload = () => {
    if (uploadedFiles.length > 0) {
      uploadMediaMutation.mutate(uploadedFiles);
    }
  };

  // Filter media items based on search query
  const filteredMedia = mediaItems.filter((item: any) => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle media item click
  const handleMediaClick = (item: any) => {
    setSelectedFile(item);
  };

  // Handle file deletion
  const handleDeleteMedia = () => {
    if (selectedFile) {
      deleteMediaMutation.mutate(selectedFile.id);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "The media URL has been copied to clipboard",
      });
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex space-x-2">
          <Button 
            id="upload-media-button"
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Media
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-none rounded-l-md"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-none rounded-r-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-md">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No media files found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No results match your search query. Try something different."
              : "Upload media files to see them here."}
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>Upload Media</Button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Media Grid/List */}
          <div className={`flex-1 ${selectedFile ? 'hidden md:block' : ''}`}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item: any) => (
                  <div 
                    key={item.id}
                    className={`
                      relative group cursor-pointer overflow-hidden rounded-md border
                      ${selectedFile?.id === item.id ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => handleMediaClick(item)}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {item.mimetype.startsWith('image/') ? (
                        <img 
                          src={item.url} 
                          alt={item.filename} 
                          className="h-full w-full object-cover transition-all group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 text-white w-full truncate">
                        <p className="truncate text-sm font-medium">{item.filename}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((item: any) => (
                      <TableRow 
                        key={item.id}
                        className={selectedFile?.id === item.id ? 'bg-muted/50' : ''}
                        onClick={() => handleMediaClick(item)}
                      >
                        <TableCell>
                          {item.mimetype.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {item.mimetype.startsWith('image/') && (
                              <div className="h-8 w-8 mr-2 overflow-hidden rounded border">
                                <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <span className="truncate max-w-[200px]">{item.filename}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(item.size)}</TableCell>
                        <TableCell>{new Date(item.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(item);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Media Details */}
          {selectedFile && (
            <div className="w-full md:w-80 space-y-4 border rounded-md p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">File Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8 md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="aspect-square w-full overflow-hidden rounded-md border bg-muted">
                {selectedFile.mimetype.startsWith('image/') ? (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.filename} 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">File name:</span>
                  <p className="truncate">{selectedFile.filename}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <p>{selectedFile.mimetype}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Size:</span>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Uploaded:</span>
                  <p>{new Date(selectedFile.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">URL:</span>
                  <div className="flex mt-1">
                    <Input 
                      value={selectedFile.url} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(selectedFile.url)}
                      className="ml-2"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between space-x-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(selectedFile.url)}
                  className="flex-1"
                >
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMedia}
                  disabled={deleteMediaMutation.isPending}
                  className="flex-1"
                >
                  {deleteMediaMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media Files</DialogTitle>
            <DialogDescription>
              Upload images and other media files to use in your content.
            </DialogDescription>
          </DialogHeader>

          <div
            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm mb-1">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Images, videos, documents and other files
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <Button variant="secondary" size="sm">
              Browse Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setUploadedFiles([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rituals Manager Component
function RitualsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all healing rituals
  const { data: rituals = [], isLoading } = useQuery({
    queryKey: ['/api/healing-rituals'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/healing-rituals');
        if (!res.ok) throw new Error('Failed to fetch healing rituals');
        return await res.json();
      } catch (error) {
        console.error('Error fetching healing rituals:', error);
        return [];
      }
    },
  });

  // Delete ritual mutation
  const deleteRitualMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/healing-rituals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete ritual');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/healing-rituals'] });
      toast({
        title: "Ritual deleted",
        description: "The ritual has been successfully deleted",
      });
      setIsDeleting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  // Filter rituals based on search term
  const filteredRituals = rituals.filter((ritual: any) => 
    ritual.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ritual.description && ritual.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle ritual deletion
  const handleDeleteRitual = (id: number) => {
    setIsDeleting(true);
    deleteRitualMutation.mutate(id);
  };

  // Handle editing a ritual
  const handleEditRitual = (ritual: any) => {
    setSelectedRitual(ritual);
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Healing Rituals</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rituals..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            id="add-ritual-button"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Ritual
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredRituals.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-md">
          <h3 className="text-lg font-semibold mb-2">No rituals found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "No results match your search query. Try something different."
              : "There are no healing rituals available. Add one to get started."}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>Add New Ritual</Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead className="hidden md:table-cell">Course URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRituals.map((ritual: any) => (
                <TableRow key={ritual.id}>
                  <TableCell className="font-medium">{ritual.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{ritual.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {ritual.type || "General"} | {ritual.targetChakra || ritual.targetEmotion || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{ritual.type || "General"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ritual.targetChakra ? 
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {ritual.targetChakra}
                      </Badge> 
                      : null}
                    {ritual.targetEmotion ? 
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-1">
                        {ritual.targetEmotion}
                      </Badge> 
                      : null}
                    {!ritual.targetChakra && !ritual.targetEmotion && "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ritual.courseUrl ? (
                      <span className="text-blue-600 hover:underline">{new URL(ritual.courseUrl).pathname}</span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRitual(ritual)}
                        title="Edit Ritual"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteRitual(ritual.id)}
                        disabled={isDeleting}
                        title="Delete Ritual"
                      >
                        {isDeleting && ritual.id === selectedRitual?.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Ritual Add/Edit Dialog will be implemented here */}
      <RitualDialog 
        isOpen={isAddDialogOpen || isEditDialogOpen} 
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedRitual(null);
        }}
        ritual={selectedRitual}
        isEditing={isEditDialogOpen}
      />
    </div>
  );
}

// Ritual Dialog Component for Add/Edit
function RitualDialog({ 
  isOpen, 
  onClose, 
  ritual = null, 
  isEditing = false 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  ritual?: any | null;
  isEditing?: boolean;
}) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    instructions: '',
    targetChakra: '',
    targetEmotion: '',
    thumbnailUrl: '',
    courseUrl: '',
    videoUrl: '',
    duration: '30min',
    // Lesson 1 fields
    lesson1Title: '',
    lesson1Description: '',
    lesson1Duration: '10min',
    // Lesson 2 fields
    lesson2Title: '',
    lesson2Description: '',
    lesson2Duration: '15min',
    // Lesson 3 fields
    lesson3Title: '',
    lesson3Description: '',
    lesson3Duration: '5min',
  });
  const [step, setStep] = useState<'details' | 'media' | 'course'>('details');
  const [selectedMainImage, setSelectedMainImage] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Media library for selecting images
  const { data: mediaItems = [] } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        return await res.json();
      } catch (error) {
        console.error('Error fetching media:', error);
        return [];
      }
    },
    enabled: isOpen,
  });

  // Filter only images
  const imageMedia = mediaItems.filter((item: any) => 
    item.mimetype.startsWith('image/')
  );

  // Reset form on dialog open/close
  useEffect(() => {
    if (isOpen && isEditing && ritual) {
      setForm({
        name: ritual.name || '',
        type: ritual.type || '',
        description: ritual.description || '',
        instructions: ritual.instructions || '',
        targetChakra: ritual.targetChakra || '',
        targetEmotion: ritual.targetEmotion || '',
        thumbnailUrl: ritual.thumbnailUrl || '',
        courseUrl: ritual.courseUrl || '',
        videoUrl: ritual.videoUrl || '',
        duration: ritual.duration || '30min',
        // Lesson 1 fields
        lesson1Title: ritual.lesson1Title || '',
        lesson1Description: ritual.lesson1Description || '',
        lesson1Duration: ritual.lesson1Duration || '10min',
        // Lesson 2 fields
        lesson2Title: ritual.lesson2Title || '',
        lesson2Description: ritual.lesson2Description || '',
        lesson2Duration: ritual.lesson2Duration || '15min',
        // Lesson 3 fields
        lesson3Title: ritual.lesson3Title || '',
        lesson3Description: ritual.lesson3Description || '',
        lesson3Duration: ritual.lesson3Duration || '5min',
      });
      setSelectedMainImage(ritual.mainImageUrl || null);
      setSelectedThumbnail(ritual.thumbnailUrl || null);
    } else if (isOpen && !isEditing) {
      setForm({
        name: '',
        type: '',
        description: '',
        instructions: '',
        targetChakra: '',
        targetEmotion: '',
        thumbnailUrl: '',
        courseUrl: '',
        videoUrl: '',
        duration: '30min',
        // Lesson 1 fields
        lesson1Title: '',
        lesson1Description: '',
        lesson1Duration: '10min',
        // Lesson 2 fields
        lesson2Title: '',
        lesson2Description: '',
        lesson2Duration: '15min',
        // Lesson 3 fields
        lesson3Title: '',
        lesson3Description: '',
        lesson3Duration: '5min',
      });
      setSelectedMainImage(null);
      setSelectedThumbnail(null);
    }
    
    // Reset step when opening dialog
    if (isOpen) {
      setStep('details');
    }
  }, [isOpen, isEditing, ritual]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Create/Update ritual mutation
  const saveRitualMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing 
        ? `/api/healing-rituals/${ritual.id}` 
        : '/api/healing-rituals';
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, data);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} ritual`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/healing-rituals'] });
      toast({
        title: isEditing ? "Ritual updated" : "Ritual created",
        description: `The ritual has been successfully ${isEditing ? 'updated' : 'created'}`,
      });
      setIsSubmitting(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare data for submission
    const data = {
      ...form,
      mainImageUrl: selectedMainImage,
      thumbnailUrl: selectedThumbnail,
    };
    
    saveRitualMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Healing Ritual' : 'Add New Healing Ritual'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of this healing ritual'
              : 'Create a new healing ritual for users to practice'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b">
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'details' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('details')}
          >
            Details
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'media' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('media')}
          >
            Media
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'course' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('course')}
          >
            Course Content
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-1">
          <form onSubmit={handleSubmit}>
            {/* Details Tab */}
            {step === 'details' && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Ritual Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter ritual name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      placeholder="Meditation, Breathwork, etc."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter a detailed description"
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={form.instructions}
                      onChange={handleChange}
                      placeholder="Step-by-step instructions for the ritual"
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetChakra">Target Chakra</Label>
                      <Select 
                        name="targetChakra" 
                        value={form.targetChakra || "none"} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, targetChakra: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a chakra" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="root">Root Chakra</SelectItem>
                          <SelectItem value="sacral">Sacral Chakra</SelectItem>
                          <SelectItem value="solar_plexus">Solar Plexus Chakra</SelectItem>
                          <SelectItem value="heart">Heart Chakra</SelectItem>
                          <SelectItem value="throat">Throat Chakra</SelectItem>
                          <SelectItem value="third_eye">Third Eye Chakra</SelectItem>
                          <SelectItem value="crown">Crown Chakra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="targetEmotion">Target Emotion</Label>
                      <Select 
                        name="targetEmotion" 
                        value={form.targetEmotion || "none"} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, targetEmotion: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an emotion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="anxiety">Anxiety</SelectItem>
                          <SelectItem value="depression">Depression</SelectItem>
                          <SelectItem value="anger">Anger</SelectItem>
                          <SelectItem value="fear">Fear</SelectItem>
                          <SelectItem value="grief">Grief</SelectItem>
                          <SelectItem value="shame">Shame</SelectItem>
                          <SelectItem value="guilt">Guilt</SelectItem>
                          <SelectItem value="joy">Joy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Media Tab */}
            {step === 'media' && (
              <div className="space-y-6 py-2">
                <div>
                  <h3 className="font-medium mb-2">Main Image</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select an image from your media library to use as the main image for this ritual.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto p-1">
                    {imageMedia.map((media: any) => (
                      <div 
                        key={media.id}
                        className={`
                          relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer
                          ${selectedMainImage === media.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}
                        `}
                        onClick={() => setSelectedMainImage(media.url)}
                      >
                        <img 
                          src={media.url} 
                          alt={media.filename} 
                          className="w-full h-full object-cover"
                        />
                        {selectedMainImage === media.url && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Thumbnail Image</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a thumbnail image to appear alongside the main image.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto p-1">
                    {imageMedia.map((media: any) => (
                      <div 
                        key={`thumb-${media.id}`}
                        className={`
                          relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer
                          ${selectedThumbnail === media.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}
                        `}
                        onClick={() => setSelectedThumbnail(media.url)}
                      >
                        <img 
                          src={media.url} 
                          alt={media.filename} 
                          className="w-full h-full object-cover"
                        />
                        {selectedThumbnail === media.url && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Content Tab */}
            {step === 'course' && (
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="courseUrl">Course URL</Label>
                  <Input
                    id="courseUrl"
                    name="courseUrl"
                    value={form.courseUrl}
                    onChange={handleChange}
                    placeholder="e.g., /courses/meditation-mastery"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL path for the detailed course page when users click "Learn More"
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://www.youtube.com/embed/abc123"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL for embedded video content in the course page
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="duration">Course Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g., 15 minutes, 1 hour"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected time to complete the practice or course
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium mb-3">Curriculum Sections</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The course curriculum will be displayed on the course page. You can add up to 3 lessons.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 1</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson1Title">Title</Label>
                          <Input
                            id="lesson1Title"
                            name="lesson1Title"
                            value={form.lesson1Title}
                            onChange={handleChange}
                            placeholder="Introduction to the practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson1Description">Description</Label>
                          <Textarea
                            id="lesson1Description"
                            name="lesson1Description"
                            value={form.lesson1Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson1Duration">Duration</Label>
                          <Select
                            value={form.lesson1Duration || "10min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson1Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 2</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson2Title">Title</Label>
                          <Input
                            id="lesson2Title"
                            name="lesson2Title"
                            value={form.lesson2Title}
                            onChange={handleChange}
                            placeholder="The Main Practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson2Description">Description</Label>
                          <Textarea
                            id="lesson2Description"
                            name="lesson2Description"
                            value={form.lesson2Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson2Duration">Duration</Label>
                          <Select
                            value={form.lesson2Duration || "15min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson2Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 3</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson3Title">Title</Label>
                          <Input
                            id="lesson3Title"
                            name="lesson3Title"
                            value={form.lesson3Title}
                            onChange={handleChange}
                            placeholder="Integration & Daily Practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson3Description">Description</Label>
                          <Textarea
                            id="lesson3Description"
                            name="lesson3Description"
                            value={form.lesson3Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson3Duration">Duration</Label>
                          <Select
                            value={form.lesson3Duration || "5min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson3Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                

              </div>
            )}
          </form>
        </div>
        
        <DialogFooter className="border-t p-4">
          <div className="flex gap-2 justify-between w-full">
            <div>
              {step !== 'details' && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step === 'media' ? 'details' : 'media')}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step !== 'course' ? (
                <Button onClick={() => setStep(step === 'details' ? 'media' : 'course')}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Ritual' : 'Create Ritual'
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Events Manager Component
function EventsManager() {
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Community Events</h2>
        <Button id="add-event-button">
          <Plus className="h-4 w-4 mr-2" />
          Add New Event
        </Button>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Events Management</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage all community events, schedule new ones, and track attendance.
        </p>
      </div>
    </div>
  );
}

// Users Manager Component
function UsersManager() {
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">User Management</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage users, view user profiles, and track user activity.
        </p>
      </div>
    </div>
  );
}

// Settings Manager Component
function SettingsManager() {
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Application Settings</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage application settings, customize the site appearance, and configure integrations.
        </p>
      </div>
    </div>
  );
}