import { log, BigInt, Address, ByteArray, Bytes, dataSource } from '@graphprotocol/graph-ts'

import { Transfer } from '../entities/ERC20/ERC20'
import { DepositETH, OrderExecuted, OrderCancelled, PineCore } from '../entities/PineCore/PineCore'

import { Order } from '../entities/schema'
import { getAddressByNetwork, OPEN, CANCELLED, EXECUTED } from '../modules/Order'


/**
 * @dev ERC20 transfer should have an extra data we use to identify a pine order.
 * A transfer with a pine order looks like:
 *
 * 0xa9059cbb
 * 000000000000000000000000c8b6046580622eb6037d5ef2ca74faf63dc93631
 * 0000000000000000000000000000000000000000000000000de0b6b3a7640000
 * 0000000000000000000000000000000000000000000000000000000000000060
 * 0000000000000000000000000000000000000000000000000000000000000120
 * 000000000000000000000000ef6c6b0bce4d2060efab0d16736c6ce7473deddc
 * 000000000000000000000000c7ad46e0b8a400bb3c915120d284aafba8fc4735
 * 0000000000000000000000005523f2fc0889a6d46ae686bcd8daa9658cf56496
 * 0000000000000000000000008153f16765f9124d754c432add5bd40f76f057b4
 * 00000000000000000000000000000000000000000000000000000000000000c0
 * 2070696e652e66696e616e63652020d83ddc09ea73fa863b164de440a270be31
 * 0000000000000000000000000000000000000000000000000000000000000040
 * 000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
 * 00000000000000000000000000000000000000000000000004b1e20ebf83c000
 *
 * The important part is 2070696e652e66696e616e6365 which is the hexa of ` pine.finance` used for the secret.
 * We use that as the index to parse the input data:
 * - module = 5 * 32 bytes before secret index
 * - inputToken = ERC20 which emits the Transfer event
 * - owner = `from` parameter of the Transfer event
 * - witness = 2 * 32 bytes before secret index
 * - secret = 32 bytes from the secret index
 * - data = 2 * 32 bytes after secret index (64 bytes length)
 * - outputToken =  2 * 32 bytes after secret index
 * - minReturn =  3 * 32 bytes after secret index
 *
 * @param event
 */
export function handleOrderCreationByERC20Transfer(event: Transfer): void {
  let index_ = event.transaction.input.toHexString().indexOf('2070696e652e66696e616e6365')
  if (index_ == -1) {
    return
  }

  // Skip multiple transfer events
  let recipient = '0x' + event.transaction.input.toHexString().substr(BigInt.fromI32(10 + 24).toI32(), 40)
  if (recipient != event.params.to.toHexString()) {
    log.debug('Skipped Transfer recipient expected {}, but receive {}. On Tx {}', [recipient, event.params.to.toHexString(), event.transaction.hash.toHexString()])
    return
  }

  let index = BigInt.fromI32(index_)

  // Transaction input should be bigger than index + (64 * 4)
  // Index should be bigger than (64 * 5)
  if (!(index.minus(BigInt.fromI32(64 * 5)).gt(BigInt.fromI32(0)) &&
    BigInt.fromI32(event.transaction.input.toHexString().length).ge(index.plus(BigInt.fromI32((64 * 4) - 1))))) {
    log.debug('Error creating an order from an ERC20 transfer: {}', [event.transaction.hash.toHexString()])
    return
  }

  let module = '0x' + event.transaction.input.toHexString().substr(index.minus(BigInt.fromI32((64 * 5) - 24)).toI32(), 40)
  let inputToken = event.transaction.to.toHex()
  let owner = event.transaction.from.toHex()
  let witness = '0x' + event.transaction.input.toHexString().substr(index.minus(BigInt.fromI32((64 * 2) - 24)).toI32(), 40)
  let data = Bytes.fromHexString('0x' + event.transaction.input.toHexString().substr(index.plus(BigInt.fromI32(64 * 2)).toI32(), 64 * 2)) as Bytes

  let pineCore = PineCore.bind(getAddressByNetwork(dataSource.network()))

  let order = new Order(
    pineCore.keyOf(
      Address.fromString(module),
      Address.fromString(inputToken),
      Address.fromString(owner),
      Address.fromString(witness),
      data
    ).toHex()
  )

  // Order data
  order.owner = owner
  order.module = module
  order.inputToken = inputToken
  order.witness = witness
  order.secret = '0x' + event.transaction.input.toHexString().substr(index.toI32(), 64)
  order.outputToken = '0x' + event.transaction.input.toHexString().substr(index.plus(BigInt.fromI32((64 * 2) + 24)).toI32(), 40)
  order.minReturn = BigInt.fromUnsignedBytes(
    ByteArray.fromHexString(
      '0x' + event.transaction.input.toHexString().substr(index.plus(BigInt.fromI32((64 * 3) + 24)).toI32(), 64)
    ).reverse() as Bytes
  )
  order.inputAmount = event.params.value
  order.vault = event.params.to.toHex()
  order.data = data
  order.status = OPEN

  // Tx data
  order.inputData = event.transaction.input
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
  order.inputToken = '0x' + event.params._data.toHex().substr(2 + (64 * 1) + 24, 40) /// 1 - 32 bytes
  order.witness = '0x' + event.params._data.toHex().substr(2 + (64 * 3) + 24, 40) // 3  - 20 bytes
  order.secret = '0x' + event.params._data.toHex().substr(2 + (64 * 5), 64) // 5  - 32 bytes
  order.outputToken = '0x' + event.params._data.toHex().substr(2 + (64 * 7) + 24, 40) // 7 - 20 bytes

  order.minReturn = BigInt.fromUnsignedBytes(ByteArray.fromHexString('0x' + event.params._data.toHex().substr(2 + (64 * 8), 64)).reverse() as Bytes) // 8 - 32 bytes
  order.inputAmount = event.params._amount
  order.vault = event.transaction.to.toHex()
  order.data = Bytes.fromHexString('0x' + event.params._data.toHex().substr(2 + (64 * 7), 64 * 2)) as Bytes
  order.status = OPEN

  // Tx data
  order.inputData = event.transaction.input
  order.createdTxHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp

  order.save()
}

export function handleOrderExecuted(event: OrderExecuted): void {
  let order = Order.load(event.params._key.toHex())

  if (order == null) {
    return
  }

  order.executedTxHash = event.transaction.hash
  order.status = EXECUTED
  order.bought = event.params._bought
  order.auxData = event.params._auxData
  order.updatedAt = event.block.timestamp

  order.save()
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let order = Order.load(event.params._key.toHex())
  if (order == null) {
    return
  }

  // Check if the cancel was a complete success or not.
  // Sometimes by running out of gas the tx is partially completed
  // check: https://etherscan.io/tx/0x29da2e620e5f8606d74a9b73c353a8f393acc9cd58c1750dd2edd05cf33a5d1c
  let pineCore = PineCore.bind(event.address)
  let res = pineCore.try_existOrder(
    Address.fromString(order.module),
    Address.fromString(order.inputToken),
    Address.fromString(order.owner),
    Address.fromString(order.witness),
    order.data
  )

  if (res.reverted || res.value) {
    return
  }

  order.cancelledTxHash = event.transaction.hash
  order.status = CANCELLED
  order.updatedAt = event.block.timestamp

  order.save()
}
