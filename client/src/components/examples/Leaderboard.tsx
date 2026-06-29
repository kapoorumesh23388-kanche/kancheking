import Leaderboard from '../Leaderboard'

export default function LeaderboardExample() {
  const mockEntries = [
    { rank: 1, name: "Priya Sharma", marbles: 5000, winRate: 87 },
    { rank: 2, name: "Arjun Patel", marbles: 4500, winRate: 82 },
    { rank: 3, name: "Kavya Singh", marbles: 4200, winRate: 79 },
    { rank: 4, name: "Rohan Gupta", marbles: 3800, winRate: 75 },
    { rank: 5, name: "Ananya Das", marbles: 3500, winRate: 71 },
  ];

  return <Leaderboard entries={mockEntries} />
}


