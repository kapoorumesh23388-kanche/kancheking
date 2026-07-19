import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogPostSummary {
  id: string;
  category: string;
  coverColor: string;
  readTimeMinutes: number;
  publishedAt: string;
  title: string;
  excerpt: string;
  isTranslated: boolean;
}

export default function BlogPage() {
  const [blogLang, setBlogLang] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("blogLanguage") as "en" | "hi") || "en";
  });
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("blogLanguage", blogLang);
  }, [blogLang]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/blog?lang=${blogLang}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [blogLang]);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#00D9FF] via-[#E91E8C] to-[#00D9FF] bg-clip-text text-transparent"
          >
            Kanche Stories
          </h1>
          <p className="text-[#00D9FF]/80 text-sm md:text-base mb-5">
            Real stories of childhood, marbles, and the streets we grew up playing in
          </p>

          {/* Blog-specific EN/HI toggle */}
          <div className="inline-flex bg-white/5 border border-[#00D9FF]/30 rounded-full p-1">
            <button
              onClick={() => setBlogLang("en")}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                blogLang === "en" ? "bg-[#00D9FF] text-black" : "text-[#00D9FF]"
              }`}
              data-testid="button-blog-lang-en"
            >
              English
            </button>
            <button
              onClick={() => setBlogLang("hi")}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                blogLang === "hi" ? "bg-[#00D9FF] text-black" : "text-[#00D9FF]"
              }`}
              data-testid="button-blog-lang-hi"
            >
              हिन्दी
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Loading stories...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No stories yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.id}?lang=${blogLang}`}>
                <Card className="bg-white/5 border border-[#00D9FF]/20 hover:border-[#00D9FF]/50 transition-all cursor-pointer h-full overflow-hidden hover:-translate-y-1">
                  <div
                    className="h-36 w-full flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${post.coverColor}55, ${post.coverColor}22)` }}
                  >
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <span className="text-5xl">🔵</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wide bg-[#00D9FF]/15 text-[#00D9FF] px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{post.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2">
                      Story #{index + 1}: {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    {!post.isTranslated && (
                      <p className="text-[10px] text-yellow-400/80 mt-2">
                        Not yet available in Hindi — showing English
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
