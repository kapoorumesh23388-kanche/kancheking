import FistDisplay from '../FistDisplay'

export default function FistDisplayExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FistDisplay isOpen={false} label="Closed Fist" />
      <FistDisplay isOpen={true} marbleCount={3} label="Revealed!" />
    </div>
  )
}


