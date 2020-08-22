import { log } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { handleOrderCreationByERC20Transfer } from './Order'

export function handleERC20Transfer(event: Transfer): void {
  let index = event.transaction.input.toString().indexOf(' uniswapex.io')
  if (index !== -1) {
    handleOrderCreationByERC20Transfer(index, event)
    // } catch (e) {
    //   log.debug('Error trying to decode ERC20 transfer: {}', [event.transaction.hash.toHexString()])
    // }
  }
}