import { Transfer } from '../entities/ERC20/ERC20'
import { handleOrderCreationByERC20Transfer } from './Order'

export function handleERC20Transfer(event: Transfer): void {
  handleOrderCreationByERC20Transfer(event)
}