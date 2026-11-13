export function EquipmentIcon({ kind }: { kind: 'cooking' | 'laundry' }) {
  return <span className={`equipment-icon icon-${kind}`} aria-hidden="true">
    <i /><b /><em />
  </span>
}
