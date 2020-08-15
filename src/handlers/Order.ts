import { Bytes } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { DepositETH, OrderExecuted, OrderCancelled } from '../entities/UniswapexV2/UniswapexV2'

import { Order } from '../entities/schema'
import { OPEN } from '../modules/Order'


export function handleOrderCreation(event: Transfer): void {
  //@TODO: Check if two orders at the same tx is possible

  let order = new Order(event.transaction.hash.toHexString())
  order.owner = event.transaction.from.toHex()
  order.fromToken = event.transaction.to.toHex()
  order.data = event.transaction.input
  order.amount = event.params.value
  // order.toToken
  order.txHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp
  order.status = OPEN

  order.save()
}

export function handleETHOrderCreated(event: DepositETH): void {
  let order = new Order(event.transaction.hash.toHexString())
  order.owner = event.transaction.from.toHex()
  order.fromToken = event.transaction.to.toHex()
  order.data = event.transaction.input
  order.amount = event.params._amount
  // order.toToken
  order.txHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp
  order.status = OPEN
  order.save()
}

export function handleOrderExecuted(event: OrderExecuted): void { }
export function handleOrderCancelled(event: OrderCancelled): void { }
