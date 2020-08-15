import { Bytes } from "@graphprotocol/graph-ts"

export const OPEN = 'open'
export const SOLD = 'sold'
export const CANCELLED = 'cancelled'

export function parseOrderFromERC20Transfer(txInput: Bytes): Bytes {
  return txInput
}