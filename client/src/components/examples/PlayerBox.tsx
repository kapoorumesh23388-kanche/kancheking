import PlayerBox from '../PlayerBox'

export default function PlayerBoxExample() {
  return (
    <div className="flex gap-8 flex-wrap justify-center items-center">
      <PlayerBox
        name="Player 1"
        marbles={150}
        role="Holder"
        isActive={true}
      />
      <div className="text-5xl font-bold text-primary" style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)' }}>
        VS
      </div>
      <PlayerBox
        name="Player 2"
        marbles={120}
        role="Guesser"
        isActive={false}
      />
    </div>
  )
}
