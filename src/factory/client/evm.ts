import { EIP1559FeeProvider, OptimismChainProvider, RpcFeeProvider } from '@chainify/evm';
import { asL2Provider } from '@eth-optimism/sdk';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { AccountType, Network } from '../../store/types';
import { HTLC_CONTRACT_ADDRESS } from '../../utils/chainify';
import { ChainNetworks } from '../../utils/networks';
import { createEVMClient } from './clients';

const defaultSwapOptions = {
  contractAddress: HTLC_CONTRACT_ADDRESS,
};

export function createEthClient(network: Network, mnemonic: string, accountType: AccountType, derivationPath: string) {
  const ethNetwork = ChainNetworks.ethereum[network];
  const feeProvider = new EIP1559FeeProvider(ethNetwork.rpcUrl as string);
  return createEVMClient(ethNetwork, mnemonic, accountType, derivationPath, defaultSwapOptions, feeProvider);
}

export function createRskClient(network: Network, mnemonic: string, accountType: AccountType, derivationPath: string) {
  const rskNetwork = ChainNetworks.rsk[network];
  const feeProvider = new RpcFeeProvider(rskNetwork.rpcUrl, {
    slowMultiplier: 1,
    averageMultiplier: 1,
    fastMultiplier: 1.25,
  });

  const swapOptions = {
    ...defaultSwapOptions,
    gasLimitMargin: 3000, // 30%;
  };

  return createEVMClient(rskNetwork, mnemonic, accountType, derivationPath, swapOptions, feeProvider);
}

export function createBSCClient(network: Network, mnemonic: string, derivationPath: string) {
  const bscNetwork = ChainNetworks.bsc[network];

  const feeProvider = new RpcFeeProvider(bscNetwork.rpcUrl as string, {
    slowMultiplier: 1,
    averageMultiplier: 2,
    fastMultiplier: 2.2,
  });

  return createEVMClient(bscNetwork, mnemonic, AccountType.Default, derivationPath, defaultSwapOptions, feeProvider);
}

export function createPolygonClient(network: Network, mnemonic: string, derivationPath: string) {
  const polygonNetwork = ChainNetworks.polygon[network];

  const feeProvider =
    network === Network.Testnet
      ? new EIP1559FeeProvider(polygonNetwork.rpcUrl as string)
      : new RpcFeeProvider(polygonNetwork.rpcUrl as string, {
          slowMultiplier: 1,
          averageMultiplier: 2,
          fastMultiplier: 2.2,
        });

  return createEVMClient(
    polygonNetwork,
    mnemonic,
    AccountType.Default,
    derivationPath,
    defaultSwapOptions,
    feeProvider
  );
}

export function createArbitrumClient(network: Network, mnemonic: string, derivationPath: string) {
  const arbitrumNetwork = ChainNetworks.arbitrum[network];

  const feeProvider = new RpcFeeProvider(arbitrumNetwork.rpcUrl as string, {
    slowMultiplier: 1,
    averageMultiplier: 1,
    fastMultiplier: 1.25,
  });

  return createEVMClient(
    arbitrumNetwork,
    mnemonic,
    AccountType.Default,
    derivationPath,
    defaultSwapOptions,
    feeProvider
  );
}

export function createAvalancheClient(network: Network, mnemonic: string, derivationPath: string) {
  const avalancheNetwork = ChainNetworks.avalanche[network];

  const feeProvider = new RpcFeeProvider(avalancheNetwork.rpcUrl as string, {
    slowMultiplier: 1,
    averageMultiplier: 2,
    fastMultiplier: 2.2,
  });

  return createEVMClient(
    avalancheNetwork,
    mnemonic,
    AccountType.Default,
    derivationPath,
    defaultSwapOptions,
    feeProvider
  );
}

export function createFuseClient(network: Network, mnemonic: string, derivationPath: string) {
  const fuseNetwork = ChainNetworks.fuse[network];

  const feeProvider = new RpcFeeProvider(fuseNetwork.rpcUrl as string, {
    slowMultiplier: 1,
    averageMultiplier: 1,
    fastMultiplier: 1.25,
  });

  return createEVMClient(fuseNetwork, mnemonic, AccountType.Default, derivationPath, defaultSwapOptions, feeProvider);
}

export function createOptimismClient(network: Network, mnemonic: string, derivationPath: string) {
  const optimismNetwork = ChainNetworks.optimism[network];
  const jsonRpcProvider = asL2Provider(new StaticJsonRpcProvider(optimismNetwork.rpcUrl));
  const chainProvider = new OptimismChainProvider(optimismNetwork, jsonRpcProvider, {
    slowMultiplier: 1,
    averageMultiplier: 1,
    fastMultiplier: 1,
  });

  return createEVMClient(
    optimismNetwork,
    mnemonic,
    AccountType.Default,
    derivationPath,
    defaultSwapOptions,
    undefined,
    chainProvider
  );
}
