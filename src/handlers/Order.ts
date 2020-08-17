import { BigInt, Address, ByteArray, Bytes, dataSource } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { DepositETH, OrderExecuted, OrderCancelled, UniswapexV2 } from '../entities/UniswapexV2/UniswapexV2'

import { Order } from '../entities/schema'
import { getAddressByNetwork, OPEN, CANCELLED, EXECUTED } from '../modules/Order'


export function handleOrderCreation(event: Transfer): void {
  //@TODO: Check if two orders at the same tx is possible

  let module = '0x' + event.transaction.input.toHex().substr(10 + (64 * 4) + 24, 40) /// 4 - 20 bytes
  let inputToken = event.transaction.to.toHex()
  let owner = event.transaction.from.toHex()
  let witness = '0x' + event.transaction.input.toHex().substr(10 + (64 * 7) + 24, 40) // 7  - 20 bytes

  let uniswapExV2 = UniswapexV2.bind(getAddressByNetwork(dataSource.network()))

  let order = new Order(uniswapExV2.keyOf(Address.fromString(module),
    Address.fromString(inputToken),
    Address.fromString(owner),
    Address.fromString(witness),
    Bytes.fromHexString('0x' + event.transaction.input.toHex().substr(10 + (64 * 11), 64 * 2)) as Bytes // 10  - 64 bytes
  ).toHex())

  // Order data
  order.owner = owner
  order.module = module
  order.fromToken = inputToken
  order.witness = witness
  order.secret = '0x' + event.transaction.input.toHex().substr(10 + (64 * 9), 64) /// 9 - 32 bytes
  order.toToken = '0x' + event.transaction.input.toHex().substr(10 + (64 * 11) + 24, 40) // 11  - 20 bytes
  order.minReturn = BigInt.fromUnsignedBytes(ByteArray.fromHexString('0x' + event.transaction.input.toHexString().substr(10 + (64 * 12), 64)).reverse() as Bytes) // 12 - 32 bytes
  order.amount = event.params.value
  order.vault = event.params.to.toHex()

  // order.minReturn =
  order.data = event.transaction.input
  order.status = OPEN

  // order.toToken
  // Tx data
  order.data = event.transaction.input
  order.createdTxHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp

  order.save()
}

export function handleETHOrderCreated(event: DepositETH): void {
  let order = new Order(event.params._key.toHex())

  // Order data
  order.owner = event.transaction.from.toHex()
  order.module = '0x' + event.params._data.toHex().substr(2 + (64 * 0) + 24, 40) /// 0 - 20 bytes
  order.fromToken = '0x' + event.params._data.toHex().substr(2 + (64 * 1) + 24, 40) /// 1 - 32 bytes
  order.witness = '0x' + event.params._data.toHex().substr(2 + (64 * 3) + 24, 40) // 3  - 20 bytes
  order.secret = '0x' + event.params._data.toHex().substr(2 + (64 * 5), 64) // 5  - 32 bytes
  order.toToken = '0x' + event.params._data.toHex().substr(2 + (64 * 7) + 24, 40) // 7 - 20 bytes

  order.minReturn = BigInt.fromUnsignedBytes(ByteArray.fromHexString('0x' + event.params._data.toHex().substr(2 + (64 * 8), 64)).reverse() as Bytes) // 8 - 32 bytes
  order.amount = event.params._amount
  order.vault = event.transaction.to.toHex()
  order.status = OPEN

  // Tx data
  order.data = event.transaction.input
  order.createdTxHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp


  order.save()
}

export function handleOrderExecuted(event: OrderExecuted): void {
  let order = Order.load(event.params._key.toHex())

  order.executedTxHash = event.transaction.hash
  order.status = EXECUTED
  order.bought = event.params._bought
  order.auxData = event.params._auxData
  order.updatedAt = event.block.timestamp

  order.save()

}
export function handleOrderCancelled(event: OrderCancelled): void {
  let order = Order.load(event.params._key.toHex())

  order.cancelledTxHash = event.transaction.hash
  order.status = CANCELLED
  order.updatedAt = event.block.timestamp

  order.save()
}
