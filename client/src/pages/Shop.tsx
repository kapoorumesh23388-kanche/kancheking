import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";
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

  const { data: catalogItems = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["/api/catalog"],
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/catalog", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          pointsCost: parseInt(pointsCost),
          imageUrl,
        }),
      });
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
      return apiRequest(`/api/catalog/${itemId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    },
  });

  const handleAddItem = () => {
    if (!name || !description || !pointsCost) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    addItemMutation.mutate();
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-primary" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            Admin Panel
          </h1>
          <Button variant="outline" onClick={() => setLocation("/kanchey-king")} data-testid="button-back-admin">
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Item Form */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Catalog Item
              </CardTitle>
              <CardDescription>Add new items to the points catalog (updates quarterly)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Item Name</label>
                <Input
                  placeholder="e.g., Premium Avatar Bundle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-item-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Item description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  data-testid="input-item-desc"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Points Cost</label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                  data-testid="input-points-cost"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  data-testid="input-image-url"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold"
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

          {/* Current Catalog */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardHeader>
              <CardTitle>Catalog Items ({catalogItems.length})</CardTitle>
              <CardDescription>Manage current catalog (updates quarterly)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : catalogItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No items yet. Add the first one!</p>
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
                        <p className="text-sm text-muted-foreground truncate">{item.pointsCost?.toLocaleString()} pts</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        disabled={deleteItemMutation.isPending}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              <strong>ℹ️ Admin Note:</strong> Catalog items are updated quarterly. Players redeem these items using their points earned from gameplay. Only add items that you want to offer this quarter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
