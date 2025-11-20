import Leaderboard from "@/components/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderboardPage() {
  const globalEntries = [
    { rank: 1, name: "Priya Sharma", marbles: 5000, winRate: 87 },
    { rank: 2, name: "Arjun Patel", marbles: 4500, winRate: 82 },
    { rank: 3, name: "Kavya Singh", marbles: 4200, winRate: 79 },
    { rank: 4, name: "Rohan Gupta", marbles: 3800, winRate: 75 },
    { rank: 5, name: "Ananya Das", marbles: 3500, winRate: 71 },
    { rank: 6, name: "Vikram Mehta", marbles: 3200, winRate: 68 },
    { rank: 7, name: "Neha Reddy", marbles: 3000, winRate: 65 },
  ];

  const tournamentEntries = [
    { rank: 1, name: "Arjun Patel", marbles: 2500, winRate: 92 },
    { rank: 2, name: "Kavya Singh", marbles: 2200, winRate: 88 },
    { rank: 3, name: "Priya Sharma", marbles: 2000, winRate: 85 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-4xl mx-auto px-5">
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-bold text-primary mb-3"
            style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
          >
            Leaderboards
          </h1>
          <p className="text-xl text-muted-foreground">
            Top players and rankings
          </p>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 p-1">
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-global"
            >
              🌍 Global
            </TabsTrigger>
            <TabsTrigger
              value="tournament"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-tournament"
            >
              🏆 Tournament
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-friends"
            >
              👥 Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Leaderboard entries={globalEntries} />
          </TabsContent>

          <TabsContent value="tournament">
            <Leaderboard entries={tournamentEntries} />
          </TabsContent>

          <TabsContent value="friends">
            <div className="text-center p-10 text-muted-foreground">
              <p className="text-xl">Add friends to see their rankings!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
