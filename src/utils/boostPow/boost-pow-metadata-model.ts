import { bsv } from "bitcoin-predict"
import { BoostUtils } from "./boost-utils"

export class BoostPowMetadataModel {
  private constructor(
    private tag: Buffer,
    private minerPubKeyHash: Buffer,
    private extraNonce1: Buffer,
    private extraNonce2: Buffer,
    private userNonce: Buffer,
    private additionalData: Buffer
  ) {}

  static fromObject(params: {
    tag: string
    minerPubKeyHash: string
    extraNonce1: string
    extraNonce2: string
    userNonce: string
    additionalData: string
  }): BoostPowMetadataModel {
    return new BoostPowMetadataModel(
      BoostUtils.createBufferAndPad(params.tag, 20),
      BoostUtils.createBufferAndPad(params.minerPubKeyHash, 20),
      BoostUtils.createBufferAndPad(params.extraNonce1, 4),
      BoostUtils.createBufferAndPad(params.extraNonce2, 4),
      BoostUtils.createBufferAndPad(params.userNonce, 4),
      BoostUtils.createBufferAndPad(params.additionalData, 32)
    )
  }

  static fromBuffer(params: {
    tag: Buffer
    minerPubKeyHash: Buffer
    extraNonce1: Buffer
    extraNonce2: Buffer
    userNonce: Buffer
    additionalData: Buffer
  }): BoostPowMetadataModel {
    return new BoostPowMetadataModel(
      params.tag,
      params.minerPubKeyHash,
      params.extraNonce1,
      params.extraNonce2,
      params.userNonce,
      params.additionalData
    )
  }
  public trimBufferString(str: string, trimLeadingNulls = true): string {
    const content = Buffer.from(str, "hex").toString("utf8")
    if (trimLeadingNulls) {
      return content.replace(/\0/g, "")
    } else {
      return content
    }
  }

  getTag(): Buffer {
    return this.tag
  }
  getTagUtf8(): string {
    return this.trimBufferString(this.tag.reverse().toString("hex"), true)
  }
  getMinerPubKeyHash(): Buffer {
    return this.minerPubKeyHash
  }
  getMinerPubKeyHashUtf8(): string {
    return this.minerPubKeyHash.toString("hex")
  }
  getUserNonce(): Buffer {
    return this.userNonce
  }
  getUserNonceUtf8(): string {
    return this.trimBufferString(this.userNonce.reverse().toString("hex"), true)
  }
  getExtraNonce1(): Buffer {
    return this.extraNonce1
  }
  getExtraNonce2(): Buffer {
    return this.extraNonce2
  }
  getAdditionalData(): Buffer {
    return this.additionalData
  }
  getAdditionalDataUtf8(): string {
    return this.trimBufferString(this.additionalData.reverse().toString("hex"), true)
  }

  toString() {
    return Buffer.concat([
      this.tag,
      this.minerPubKeyHash,
      this.extraNonce1,
      this.extraNonce2,
      this.userNonce,
      this.additionalData
    ]).toString("hex")
  }

  getCoinbaseString() {
    return this.toString()
  }

  hash() {
    return bsv.crypto.Hash.sha256sha256(this.toBuffer()).reverse().toString("hex")
  }

  hashAsBuffer() {
    return bsv.crypto.Hash.sha256sha256(this.toBuffer()).reverse()
  }

  toObject() {
    return {
      tag: (this.tag.toString("hex").match(/../g) || []).reverse().join(""),
      minerPubKeyHash: (this.minerPubKeyHash.toString("hex").match(/../g) || []).reverse().join(""),
      extraNonce1: (this.extraNonce1.toString("hex").match(/../g) || []).reverse().join(""),
      extraNonce2: (this.extraNonce2.toString("hex").match(/../g) || []).reverse().join(""),
      userNonce: (this.userNonce.toString("hex").match(/../g) || []).reverse().join(""),
      additionalData: (this.additionalData.toString("hex").match(/../g) || []).reverse().join("")
    }
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      this.tag,
      this.minerPubKeyHash,
      this.extraNonce1,
      this.extraNonce2,
      this.userNonce,
      this.additionalData
    ])
  }

  toHex(): string {
    return this.toBuffer().toString("hex")
  }

  static fromString(str: string): BoostPowMetadataModel | null {
    return BoostPowMetadataModel.fromHex(str)
  }

  static fromHex(str: string): BoostPowMetadataModel | null {
    return new BoostPowMetadataModel(
      Buffer.from(str.substr(0, 40), "hex"),
      Buffer.from(str.substr(40, 40), "hex"),
      Buffer.from(str.substr(80, 8), "hex"),
      Buffer.from(str.substr(88, 8), "hex"),
      Buffer.from(str.substr(96, 8), "hex"),
      Buffer.from(str.substr(104), "hex")
    )
  }
}
