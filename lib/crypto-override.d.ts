// Type overrides for Web Crypto API
declare global {
  namespace crypto {
    interface SubtleCrypto {
      importKey(
        format: 'raw',
        keyData: BufferSource,
        algorithm: AlgorithmIdentifier | AesKeyAlgorithm,
        extractable: boolean,
        keyUsages: KeyUsage[]
      ): Promise<CryptoKey>;
      encrypt(
        algorithm: AlgorithmIdentifier | AesGcmParams,
        key: CryptoKey,
        data: BufferSource
      ): Promise<ArrayBuffer>;
      decrypt(
        algorithm: AlgorithmIdentifier | AesGcmParams,
        key: CryptoKey,
        data: BufferSource
      ): Promise<ArrayBuffer>;
    }
  }
}
export {};
