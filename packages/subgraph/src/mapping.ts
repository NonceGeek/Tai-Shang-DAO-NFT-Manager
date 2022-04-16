import {
  Web3Dev,
  Transfer,
  TokenInfoUpdated,
} from "../generated/Web3Dev/Web3Dev";
import { Token, Transfered } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toString())
  let transfered = Transfered.load(event.params.tokenId.toString())

  if (!token) {
    token = new Token(event.params.tokenId.toString())
    token.tokenInfo = ""
    token.createdAt = event.block.number.toI32()
  }
  if (!transfered) {
    transfered = new Transfered(event.params.tokenId.toString())
  }

  token.owner = event.params.to
  token.modifiedAt = event.block.number.toI32()
  transfered.from = event.params.from
  transfered.to = event.params.to

  token.save()
  transfered.save()
}

export function handlerTokenInfoUpdated(event: TokenInfoUpdated): void {
  let token = Token.load(event.params.tokenId.toString())
  if (!token) {
    return
  }
  token.tokenInfo = event.params.tokenInfo
  token.modifiedAt = event.block.number.toI32()
  token.save()
}
