import { log } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { handleOrderCreation } from './Order'

export function handleERC20Transfer(event: Transfer): void {
  log.debug('input:', [event.transaction.input.toHexString()])
  if (event.transaction.input.toHexString().indexOf('uniswapex.io') !== -1) {
    handleOrderCreation(event)
  }
}