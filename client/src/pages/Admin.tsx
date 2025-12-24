import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, LogOut, Settings, Pencil } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CatalogItem } from "@shared/schema";

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Edit item state
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPointsCost, setEditPointsCost] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Check if admin is logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  const { data: catalogItems = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["/api/catalog"],
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/catalog", {
        name,
        description,
        pointsCost: parseInt(pointsCost),
        imageUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item added to catalog!" });
      setName("");
      setDescription("");
      setPointsCost("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("DELETE", `/api/catalog/${itemId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("PUT", `/api/catalog/${itemId}`, {
        name: editName,
        description: editDescription,
        pointsCost: parseInt(editPointsCost),
        imageUrl: editImageUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item updated!" });
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("adminToken");
      const res = await apiRequest("POST", "/api/admin/change-password", {
        oldPassword,
        newPassword,
        token,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSettings(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Password change failed", variant: "destructive" });
    },
  });

  const handleAddItem = () => {
    if (!name || !description || !pointsCost) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    addItemMutation.mutate();
  };

  const handleEditItem = (item: CatalogItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description || "");
    setEditPointsCost(item.pointsCost?.toString() || "0");
    setEditImageUrl(item.imageUrl || "");
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editName || !editDescription || !editPointsCost) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    updateItemMutation.mutate(editingItem.id);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast({ title: "Success", description: "Logged out successfully!" });
    setLocation("/admin-login");
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-primary" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordSettings(!showPasswordSettings)}
              className="gap-2"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" /> Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Password Settings */}
        {showPasswordSettings && (
          <Card className="mb-8 bg-orange-500/10 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  data-testid="input-old-password"
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-change-password"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Item Form */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Catalog Item
              </CardTitle>
              <CardDescription>Add items for quarterly catalog update</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Item Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-item-name"
              />
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                data-testid="input-item-desc"
              />
              <Input
                type="number"
                placeholder="Points Cost"
                value={pointsCost}
                onChange={(e) => setPointsCost(e.target.value)}
                data-testid="input-points-cost"
              />
              <Input
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-image-url"
              />
              <Button
                className="w-full bg-gradient-to-r from-primary to-[#FFA500]"
                onClick={handleAddItem}
                disabled={addItemMutation.isPending}
                data-testid="button-add-item"
              >
                {addItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Catalog List */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardHeader>
              <CardTitle>Catalog Items ({catalogItems.length})</CardTitle>
              <CardDescription>Quarterly update management</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : catalogItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No items yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {catalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white/5 border border-primary/20 rounded-lg p-4"
                      data-testid={`item-${item.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.pointsCost?.toLocaleString()} pts</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-600"
                          onClick={() => handleEditItem(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          disabled={deleteItemMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-950 border-primary/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Pencil className="w-5 h-5" /> Edit Catalog Item
              </DialogTitle>
              <DialogDescription>
                Update item details below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Item Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                data-testid="input-edit-name"
              />
              <Textarea
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="resize-none"
                data-testid="input-edit-desc"
              />
              <Input
                type="number"
                placeholder="Points Cost"
                value={editPointsCost}
                onChange={(e) => setEditPointsCost(e.target.value)}
                data-testid="input-edit-points"
              />
              <Input
                placeholder="Image URL (optional)"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                data-testid="input-edit-image"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateItemMutation.isPending}
                className="bg-gradient-to-r from-primary to-[#FFA500]"
                data-testid="button-save-edit"
              >
                {updateItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
