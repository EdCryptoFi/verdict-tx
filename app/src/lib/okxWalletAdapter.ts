import {
  BaseMessageSignerWalletAdapter,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
  scopePollingDetectionStrategy,
  type SupportedTransactionVersions,
  type WalletError,
} from "@solana/wallet-adapter-base";
import { PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js";

/**
 * Explicit adapter for the OKX Wallet browser extension (`window.okxwallet.solana`).
 *
 * OKX also registers itself as a Wallet-Standard wallet, and `WalletProvider` dedupes a legacy
 * adapter when a standard wallet of the same name is present — so registering this is safe and
 * guarantees OKX appears in the modal even if standard registration is unavailable.
 */
export const OKXWalletName = "OKX Wallet" as WalletName<"OKX Wallet">;

interface OKXSolanaProvider {
  publicKey?: PublicKey | { toBytes(): Uint8Array };
  isConnected?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off?(event: string, handler: (...args: unknown[]) => void): void;
}

function getProvider(): OKXSolanaProvider | null {
  if (typeof window === "undefined") return null;
  const okx = (window as unknown as { okxwallet?: { solana?: OKXSolanaProvider } }).okxwallet;
  return okx?.solana ?? null;
}

const ICON =
  "data:image/svg+xml;base64," +
  btoaSafe(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#000"/><g fill="#fff"><rect x="4" y="4" width="5" height="5"/><rect x="15" y="4" width="5" height="5"/><rect x="9.5" y="9.5" width="5" height="5"/><rect x="4" y="15" width="5" height="5"/><rect x="15" y="15" width="5" height="5"/></g></svg>`
  );

function btoaSafe(s: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") return window.btoa(s);
  return Buffer.from(s, "utf8").toString("base64");
}

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = OKXWalletName;
  url = "https://www.okx.com/web3";
  icon = ICON;
  supportedTransactionVersions: SupportedTransactionVersions = new Set(["legacy", 0]);

  private _connecting = false;
  private _publicKey: PublicKey | null = null;
  private _provider: OKXSolanaProvider | null = null;
  private _readyState: WalletReadyState =
    typeof window === "undefined" ? WalletReadyState.Unsupported : WalletReadyState.NotDetected;

  constructor() {
    super();
    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (getProvider()) {
          this._readyState = WalletReadyState.Installed;
          this.emit("readyStateChange", this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicKey() {
    return this._publicKey;
  }
  get connecting() {
    return this._connecting;
  }
  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const provider = getProvider();
      if (!provider) throw new WalletNotReadyError();

      let publicKey: PublicKey;
      try {
        const res = await provider.connect();
        publicKey = new PublicKey(res.publicKey.toString());
      } catch (error: unknown) {
        throw new WalletConnectionError((error as Error)?.message, error);
      }

      provider.on("disconnect", this._disconnected);
      this._provider = provider;
      this._publicKey = publicKey;
      this.emit("connect", publicKey);
    } catch (error: unknown) {
      this.emit("error", error as WalletError);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const provider = this._provider;
    if (provider) {
      provider.off?.("disconnect", this._disconnected);
      this._provider = null;
      this._publicKey = null;
      try {
        await provider.disconnect();
      } catch (error: unknown) {
        this.emit("error", new WalletDisconnectedError((error as Error)?.message, error));
      }
    }
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();
      try {
        return (await provider.signTransaction(transaction)) as T;
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error);
      }
    } catch (error: unknown) {
      this.emit("error", error as WalletError);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();
      try {
        return (await provider.signAllTransactions(transactions)) as T[];
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error);
      }
    } catch (error: unknown) {
      this.emit("error", error as WalletError);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();
      try {
        const { signature } = await provider.signMessage(message);
        return signature;
      } catch (error: unknown) {
        throw new WalletSignMessageError((error as Error)?.message, error);
      }
    } catch (error: unknown) {
      this.emit("error", error as WalletError);
      throw error;
    }
  }

  private _disconnected = () => {
    const provider = this._provider;
    if (provider) {
      provider.off?.("disconnect", this._disconnected);
      this._provider = null;
      this._publicKey = null;
      this.emit("error", new WalletDisconnectedError());
      this.emit("disconnect");
    }
  };
}
