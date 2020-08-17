import { log, Bytes, Address } from "@graphprotocol/graph-ts"

export const OPEN = 'open'
export const EXECUTED = 'executed'
export const CANCELLED = 'cancelled'

export function parseOrderFromERC20Transfer(txInput: Bytes): Bytes {
  return txInput
}

export function getAddressByNetwork(network: string): Address {
  if (network == 'mainnet') {
    throw 'No Address specified at getAddressByNetwork for mainnet'
  } if (network == 'rinkeby') {
    return Address.fromString('0xb6548416b3db631e5351fa8ab227f85608050fdb')
  }

  throw 'No Address specified'
}