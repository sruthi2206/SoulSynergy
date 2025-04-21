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
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Healing Rituals</h2>
        <Button id="add-ritual-button">
          <Plus className="h-4 w-4 mr-2" />
          Add New Ritual
        </Button>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Rituals Management</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage all healing rituals, add new ones, and edit existing ones.
        </p>
      </div>
    </div>
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