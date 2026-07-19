import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit } from "lucide-react";

interface AdminBlogPost {
  id: string;
  category: string;
  coverColor: string;
  readTimeMinutes: number;
  publishedAt: string;
  languages: string[];
  content: Record<string, { title: string; excerpt: string; body: string }>;
}

const COVER_COLORS = ["#00D9FF", "#E91E8C", "#FFD700", "#00FF88", "#9C27B0", "#FF6B6B"];
const BLOG_LANGUAGES: Record<string, string> = { en: "English", hi: "हिन्दी (Hindi)" };

export default function AdminBlog() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("en");

  const [category, setCategory] = useState("Childhood Stories");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [readTimeMinutes, setReadTimeMinutes] = useState(6);
  const [content, setContent] = useState<Record<string, { title: string; excerpt: string; body: string }>>({});

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    fetch(`/api/user/${userId}/is-admin`)
      .then((res) => res.json())
      .then((data) => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  const loadPosts = () => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (isAdmin) loadPosts();
  }, [isAdmin]);

  const resetForm = () => {
    setEditingId(null);
    setCategory("Childhood Stories");
    setCoverColor(COVER_COLORS[0]);
    setReadTimeMinutes(6);
    setContent({});
    setActiveLang("en");
  };

  const startEdit = (post: AdminBlogPost) => {
    setEditingId(post.id);
    setCategory(post.category);
    setCoverColor(post.coverColor);
    setReadTimeMinutes(post.readTimeMinutes);
    setContent(post.content || {});
    setActiveLang("en");
  };

  const updateCurrentLangField = (field: "title" | "excerpt" | "body", value: string) => {
    setContent((prev) => ({
      ...prev,
      [activeLang]: { ...(prev[activeLang] || { title: "", excerpt: "", body: "" }), [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!content.en?.title || !content.en?.body) {
      toast({ title: "English required", description: "At least the English title and story are needed.", variant: "destructive" });
      return;
    }
    const userId = localStorage.getItem("userId");
    const payload = { category, coverColor, readTimeMinutes, content, adminId: userId };

    try {
      const res = await fetch(editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast({ title: editingId ? "Story updated" : "Story published" });
      resetForm();
      loadPosts();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: userId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Story deleted" });
      loadPosts();
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  if (isAdmin === null) return <div className="min-h-screen pt-24 text-center text-white">Checking access...</div>;
  if (isAdmin === false) return <div className="min-h-screen pt-24 text-center text-white">Admin access required.</div>;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-primary">Blog Management</h1>

        <Card className="bg-white/5 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg text-primary">{editingId ? "Edit Story" : "Add New Story"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Read time (minutes)</Label>
                <Input type="number" value={readTimeMinutes} onChange={(e) => setReadTimeMinutes(parseInt(e.target.value) || 5)} className="bg-black/30 text-white" />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Cover color</Label>
              <div className="flex gap-2">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCoverColor(c)}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ background: c, borderColor: coverColor === c ? "#fff" : "transparent" }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Editing language</Label>
              <div className="flex gap-2">
                {Object.entries(BLOG_LANGUAGES).map(([code, label]) => (
                  <Button
                    key={code}
                    type="button"
                    variant={activeLang === code ? "default" : "outline"}
                    onClick={() => setActiveLang(code)}
                    className={activeLang === code ? "bg-primary" : ""}
                  >
                    {label} {content[code]?.title ? "✓" : ""}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">English is required. Hindi can be added now or later.</p>
            </div>

            <div>
              <Label className="text-white">Title ({BLOG_LANGUAGES[activeLang]})</Label>
              <Input
                value={content[activeLang]?.title || ""}
                onChange={(e) => updateCurrentLangField("title", e.target.value)}
                className="bg-black/30 text-white"
                placeholder="Story title"
              />
            </div>
            <div>
              <Label className="text-white">Short excerpt (for the listing card)</Label>
              <Textarea
                value={content[activeLang]?.excerpt || ""}
                onChange={(e) => updateCurrentLangField("excerpt", e.target.value)}
                className="bg-black/30 text-white"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-white">Full story</Label>
              <Textarea
                value={content[activeLang]?.body || ""}
                onChange={(e) => updateCurrentLangField("body", e.target.value)}
                className="bg-black/30 text-white"
                rows={14}
                placeholder="Paste or write the full story here. Separate paragraphs with a blank line."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-[#FFA500]">
                {editingId ? "Save Changes" : "Publish Story"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-primary">Published Stories ({posts.length})</h2>
          {posts.map((post) => (
            <Card key={post.id} className="bg-white/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">{post.content.en?.title || "(untitled)"}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.category} · {post.languages.length} of 2 languages done
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="icon" variant="outline" onClick={() => startEdit(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && <p className="text-muted-foreground text-sm">No stories published yet.</p>}
        </div>
      </div>
    </div>
  );
}
