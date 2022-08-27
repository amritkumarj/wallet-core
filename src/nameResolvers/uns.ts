import { HttpClient } from '@chainify/client';
import { Nullable } from '@chainify/types';
import { Asset, AssetTypes, ChainId } from '@liquality/cryptoassets';
import { Resolution } from '@unstoppabledomains/resolution';
import buildConfig from '../build.config';

const reg = RegExp('^[.a-z0-9-]+$')
const resolution = new Resolution()
const unsConfig = buildConfig.nameResolvers.uns
interface NameResolver {
    reverseLookup(address: string): Promise<Nullable<string>>
    lookupDomain(address: string, asset: Asset): Promise<Nullable<string>>
    isValidTLD(domain: string): Promise<boolean>
}

export class UNSResolver implements NameResolver {
    supportedTlds: string[] | null
    getUNSKey(asset: Asset, noVersion: boolean = false): string {
        const symbol = asset.matchingAsset ? asset.matchingAsset : asset.code
        if(noVersion){
            return `crypto.${symbol}.address`
        }
        const chainKey = this.multiAssetChainKey(asset.chain)
        if(chainKey){
            if(asset.type == AssetTypes.native && asset.chain != ChainId.Polygon){
                return `crypto.${symbol}.address`
            }
            return `crypto.${symbol}.version.${chainKey}.address`
        }else{
            return `crypto.${symbol}.address`
        }
    }
    
    multiAssetChainKey(chainId: ChainId): string | null {
        switch (chainId) {
            case ChainId.Avalanche:
                return 'AVAX'
            case ChainId.BinanceSmartChain:
                return 'BEP20'
            case ChainId.Fuse:
                return 'FUSE'
            case ChainId.Polygon:
                return 'MATIC'
            case ChainId.Solana:
                return 'SOLANA'
            case ChainId.Terra:
                return 'TERRA'
            case ChainId.Ethereum:
            case ChainId.Arbitrum:
                return 'ERC20'
        }
        return null
    }

    async lookupDomain(address: string, asset: Asset): Promise<Nullable<string>> {
        try {
            const domain = this.preparedDomain(address)
            if (await this.isValidTLD(domain)) {
                const data = await HttpClient.get(
                    unsConfig.resolutionService + domain,
                    {},
                    { headers: { "Authorization": `Bearer ${unsConfig.alchemyKey}` } }
                )
                return data?.records[this.getUNSKey(asset)] ?? data?.records[this.getUNSKey(asset,true)] ?? null
            }
            return null
        } catch (e) {
            return null
        }
    }

    async isValidTLD(domain: string): Promise<boolean> {
        if (!this.supportedTlds) {
            const response = await fetch(unsConfig.tldAPI)
            const data = await response.json()
            if (data['tlds']) {
                this.supportedTlds = data['tlds']
            }
        }
        return this.supportedTlds?.some((tld) => domain.endsWith(tld)) ?? false
    }

    preparedDomain(domain: string): string {
        const retVal = domain ? domain.trim().toLowerCase() : ''
        if (!reg.test(retVal)) {
            throw 'Invalid domain name'
        }
        return retVal
    }

    async reverseLookup(address: string): Promise<Nullable<string>> {
        try {
            const domain = await resolution.reverse(address)
            return domain
        } catch (e) {
            return null
        }
    }
}
