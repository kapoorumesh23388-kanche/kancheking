import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BlogPostFull {
  id: string;
  category: string;
  coverColor: string;
  readTimeMinutes: number;
  publishedAt: string;
  title: string;
  body: string;
  isTranslated: boolean;
}

export default function BlogPost() {
  const { id } = useParams();
  const [blogLang, setBlogLang] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("blogLanguage") as "en" | "hi") || "en";
  });
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("blogLanguage", blogLang);
  }, [blogLang]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/blog/${id}?lang=${blogLang}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post || null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id, blogLang]);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Link href="/blog">
            <Button variant="ghost" className="flex items-center gap-2 text-[#00D9FF]">
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Button>
          </Link>
          <div className="inline-flex bg-white/5 border border-[#00D9FF]/30 rounded-full p-1">
            <button
              onClick={() => setBlogLang("en")}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                blogLang === "en" ? "bg-[#00D9FF] text-black" : "text-[#00D9FF]"
              }`}
              data-testid="button-post-lang-en"
            >
              English
            </button>
            <button
              onClick={() => setBlogLang("hi")}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                blogLang === "hi" ? "bg-[#00D9FF] text-black" : "text-[#00D9FF]"
              }`}
              data-testid="button-post-lang-hi"
            >
              हिन्दी
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Loading...</p>
        ) : !post ? (
          <p className="text-center text-muted-foreground py-20">Story not found.</p>
        ) : (
          <Card className="bg-white/5 border border-[#00D9FF]/20">
            <CardContent className="p-6 md:p-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-wide bg-[#00D9FF]/15 text-[#00D9FF] px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.readTimeMinutes} min read</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-snug">{post.title}</h1>
              {!post.isTranslated && (
                <p className="text-xs text-yellow-400/80 mb-6 bg-yellow-400/10 px-3 py-2 rounded-lg">
                  This story isn't translated into Hindi yet — showing the English version.
                </p>
              )}
              <div className="prose prose-invert max-w-none">
                {post.body.split("\n\n").map((para, i) => (
                  <p key={i} className="text-white/85 text-[15px] leading-relaxed mb-4">
                    {para}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
