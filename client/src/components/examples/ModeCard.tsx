import ModeCard from '../ModeCard'

export default function ModeCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ModeCard
        icon="ðŸŽ¯"
        title="Solo Practice"
        description="Practice your guessing skills against the computer"
      />
      <ModeCard
        icon="ðŸ‘¥"
        title="1v1 Local"
        description="Play with a friend on the same device"
      />
      <ModeCard
        icon="ðŸŒ"
        title="Online Multiplayer"
        description="Challenge players from around the world"
        requirement="100 Marbles Required"
      />
    </div>
  )
}


