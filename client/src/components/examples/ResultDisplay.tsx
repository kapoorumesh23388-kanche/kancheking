import ResultDisplay from '../ResultDisplay'

export default function ResultDisplayExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ResultDisplay
        won={true}
        marbleChange={50}
        details="You guessed correctly! The answer was Even."
      />
      <ResultDisplay
        won={false}
        marbleChange={30}
        details="Wrong guess! The answer was Odd."
      />
    </div>
  )
}
