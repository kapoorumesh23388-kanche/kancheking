import MarbleDisplay from '../MarbleDisplay'

export default function MarbleDisplayExample() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-primary text-xl font-bold mb-3">5 Marbles</h3>
        <MarbleDisplay count={5} />
      </div>
      <div>
        <h3 className="text-primary text-xl font-bold mb-3">Selected Marble</h3>
        <MarbleDisplay count={1} selected />
      </div>
    </div>
  )
}
