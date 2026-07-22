import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";

interface AdminBlogPost {
  id: string;
  category: string;
  coverColor: string;
  readTimeMinutes: number;
  publishedAt: string;
  submittedByName: string;
  submittedByEmail: string;
  likesCount: number;
  dislikesCount: number;
  languages: string[];
  content: Record<string, { title: string; excerpt: string; body: string }>;
}

const COVER_COLORS = ["#00D9FF", "#E91E8C", "#FFD700", "#00FF88", "#9C27B0", "#FF6B6B"];
const BLOG_LANGUAGES: Record<string, string> = { en: "English", hi: "हिन्दी (Hindi)" };

export default function BlogManagementSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("en");

  const [category, setCategory] = useState("Childhood Stories");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [readTimeMinutes, setReadTimeMinutes] = useState(6);
  const [submittedByName, setSubmittedByName] = useState("");
  const [submittedByEmail, setSubmittedByEmail] = useState("");
  const [content, setContent] = useState<Record<string, { title: string; excerpt: string; body: string }>>({});

  const loadPosts = () => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCategory("Childhood Stories");
    setCoverColor(COVER_COLORS[0]);
    setReadTimeMinutes(6);
    setSubmittedByName("");
    setSubmittedByEmail("");
    setContent({});
    setActiveLang("en");
  };

  const startEdit = (post: AdminBlogPost) => {
    setEditingId(post.id);
    setCategory(post.category);
    setCoverColor(post.coverColor);
    setReadTimeMinutes(post.readTimeMinutes);
    setSubmittedByName(post.submittedByName || "");
    setSubmittedByEmail(post.submittedByEmail || "");
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
    const payload = { category, coverColor, readTimeMinutes, submittedByName, submittedByEmail, content, adminId: userId };

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

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> {editingId ? "Edit Story" : "Add New Story"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <Label>Read time (minutes)</Label>
              <Input type="number" value={readTimeMinutes} onChange={(e) => setReadTimeMinutes(parseInt(e.target.value) || 5)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Submitted by (player name)</Label>
              <Input
                value={submittedByName}
                onChange={(e) => setSubmittedByName(e.target.value)}
                placeholder="e.g. Rohit Sharma"
              />
            </div>
            <div>
              <Label>Player's email (for the surprise gift)</Label>
              <Input
                value={submittedByEmail}
                onChange={(e) => setSubmittedByEmail(e.target.value)}
                placeholder="player@email.com"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            This is only visible to you here — not shown publicly on the story page.
          </p>

          <div>
            <Label className="mb-2 block">Cover color</Label>
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
            <Label className="mb-2 block">Editing language</Label>
            <div className="flex gap-2">
              {Object.entries(BLOG_LANGUAGES).map(([code, label]) => (
                <Button
                  key={code}
                  type="button"
                  variant={activeLang === code ? "default" : "outline"}
                  onClick={() => setActiveLang(code)}
                >
                  {label} {content[code]?.title ? "✓" : ""}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">English is required. Hindi can be added now or later.</p>
          </div>

          <div>
            <Label>Title ({BLOG_LANGUAGES[activeLang]})</Label>
            <Input
              value={content[activeLang]?.title || ""}
              onChange={(e) => updateCurrentLangField("title", e.target.value)}
              placeholder="Story title"
            />
          </div>
          <div>
            <Label>Short excerpt (for the listing card)</Label>
            <Textarea
              value={content[activeLang]?.excerpt || ""}
              onChange={(e) => updateCurrentLangField("excerpt", e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label>Full story</Label>
            <Textarea
              value={content[activeLang]?.body || ""}
              onChange={(e) => updateCurrentLangField("body", e.target.value)}
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
        <h3 className="text-xl font-bold text-primary">Published Stories ({posts.length})</h3>
        <p className="text-xs text-muted-foreground">Sorted by most likes — the top one each week is your surprise-gift winner.</p>
        {[...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).map((post, index) => (
          <Card key={post.id} className={`bg-white/5 ${index === 0 && post.likesCount > 0 ? "border-[#FFD700]/50" : "border-primary/20"}`}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold flex items-center gap-2">
                  {index === 0 && post.likesCount > 0 && <span>🏆</span>}
                  {post.content.en?.title || "(untitled)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {post.category} · {post.languages.length} of 2 languages done
                  {post.submittedByName && <> · by {post.submittedByName}</>}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-[#00FF88]">👍 {post.likesCount || 0}</span>
                  {" · "}
                  <span className="text-[#E91E8C]">👎 {post.dislikesCount || 0}</span>
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
  );
}
