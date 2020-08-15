// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Order extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Order entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Order entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Order", id.toString(), this);
  }

  static load(id: string): Order | null {
    return store.get("Order", id) as Order | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get fromToken(): string {
    let value = this.get("fromToken");
    return value.toString();
  }

  set fromToken(value: string) {
    this.set("fromToken", Value.fromString(value));
  }

  get toToken(): string | null {
    let value = this.get("toToken");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set toToken(value: string | null) {
    if (value === null) {
      this.unset("toToken");
    } else {
      this.set("toToken", Value.fromString(value as string));
    }
  }

  get minReturn(): BigInt | null {
    let value = this.get("minReturn");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set minReturn(value: BigInt | null) {
    if (value === null) {
      this.unset("minReturn");
    } else {
      this.set("minReturn", Value.fromBigInt(value as BigInt));
    }
  }

  get module(): string | null {
    let value = this.get("module");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set module(value: string | null) {
    if (value === null) {
      this.unset("module");
    } else {
      this.set("module", Value.fromString(value as string));
    }
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get relayer(): string | null {
    let value = this.get("relayer");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set relayer(value: string | null) {
    if (value === null) {
      this.unset("relayer");
    } else {
      this.set("relayer", Value.fromString(value as string));
    }
  }

  get status(): string {
    let value = this.get("status");
    return value.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }

  get txHash(): Bytes {
    let value = this.get("txHash");
    return value.toBytes();
  }

  set txHash(value: Bytes) {
    this.set("txHash", Value.fromBytes(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get createdAt(): BigInt {
    let value = this.get("createdAt");
    return value.toBigInt();
  }

  set createdAt(value: BigInt) {
    this.set("createdAt", Value.fromBigInt(value));
  }

  get updatedAt(): BigInt {
    let value = this.get("updatedAt");
    return value.toBigInt();
  }

  set updatedAt(value: BigInt) {
    this.set("updatedAt", Value.fromBigInt(value));
  }

  get data(): Bytes {
    let value = this.get("data");
    return value.toBytes();
  }

  set data(value: Bytes) {
    this.set("data", Value.fromBytes(value));
  }
}
