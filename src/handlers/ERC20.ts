import { log } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { handleOrderCreation } from './Order'

export function handleERC20Transfer(event: Transfer): void {
  if (event.transaction.input.toString().indexOf('uniswapex.io') !== -1) {
    handleOrderCreation(event)
  }
}