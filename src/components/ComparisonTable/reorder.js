import { arrayMove } from '@dnd-kit/sortable'

// Moves the item with id `fromId` to the position of the item with id `toId`.
// Returns the same array when either id is missing or they are equal.
export function moveItem(list, fromId, toId) {
  const from = list.indexOf(fromId)
  const to = list.indexOf(toId)
  if (from === -1 || to === -1 || from === to) return list
  return arrayMove(list, from, to)
}
