import { Address } from "@graphprotocol/graph-ts"

export const OPEN = 'open'
export const EXECUTED = 'executed'
export const CANCELLED = 'cancelled'

export function getAddressByNetwork(network: string): Address {
  if (network == 'mainnet') {
    return Address.fromString('0xd412054cca18a61278ced6f674a526a6940ebd84')
  } if (network == 'rinkeby') {
    return Address.fromString('0xd412054cca18a61278ced6f674a526a6940ebd84')
  }

  throw 'No Address specified'
}