import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Gift } from "lucide-react";
import InviteShare from "@/components/InviteShare";

interface ReferralStats {
  referralCode: string;
  joined: number;
  rewarded: number;
  pending: number;
  marblesEarned: number;
  referrerBonus: number;
  friendBonus: number;
  monthlyCap: number;
  remainingThisMonth: number;
}

/** Profile section: your invite link, share buttons and referral stats. */
export default function InviteFriendsCard() {
  const userId = localStorage.getItem("userId");
  const { data, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referral/stats", userId],
    enabled: !!userId,
  });

  if (!userId) return null;

  return (
    <div className="p-4 sm:p-6 rounded-lg border-2 border-primary/30 bg-primary/5" data-testid="card-invite-friends">
      <div className="flex items-center gap-2 mb-1">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-primary">Invite Friends, Earn Marbles</h3>
      </div>

      {isLoading || !data ? (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When a friend joins with your link and finishes their first game, you get{" "}
            <span className="text-[#00FF88] font-bold">{data.referrerBonus} marbles</span> and they get{" "}
            <span className="text-[#00FF88] font-bold">{data.friendBonus} marbles</span>.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-black/30 p-3">
              <p className="text-2xl font-bold text-primary" data-testid="text-referral-joined">{data.joined}</p>
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-3 h-3" /> Joined
              </p>
            </div>
            <div className="rounded-lg bg-black/30 p-3">
              <p className="text-2xl font-bold text-primary" data-testid="text-referral-rewarded">{data.rewarded}</p>
              <p className="text-[11px] text-muted-foreground">Rewarded</p>
            </div>
            <div className="rounded-lg bg-black/30 p-3">
              <p className="text-2xl font-bold text-[#00FF88]" data-testid="text-referral-earned">{data.marblesEarned}</p>
              <p className="text-[11px] text-muted-foreground">Marbles earned</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your code: <span className="font-mono font-bold text-primary">{data.referralCode}</span> ·{" "}
            {data.remainingThisMonth} of {data.monthlyCap} rewards left this month
            {data.pending > 0 ? ` · ${data.pending} friend(s) waiting to finish a first game` : ""}
          </p>

          <InviteShare referralCode={data.referralCode} />
        </div>
      )}
    </div>
  );
}
