export enum Status {
    NotIssued,
    NotStarted,
    Started,
    Ended
}

export const convertToStatus = (s: string) => {
    if (s == 'NotIssued') {
        return Status.NotIssued;
    }
    if (s == 'NotStarted') {
        return Status.NotStarted;
    }
    if (s == 'Started') {
        return Status.Started;
    }
    return Status.Ended;
};

export interface ISaleStatusProvider {
    status: Status;
    leftTimestamp: number;
    goal: number;
    totalBoughtAmountOfEsdt: number;
    minBuyLimit: number;
    maxBuyLimit: number;
    userLevel: number;
}

export interface IAccountStateProvider {
    boughtAmount: number;
    lockedAmount: number;
    claimableAmount: number;
    claimedReleaseCount: number;
    claimableReleaseCount: number;
    isInWhitelist: boolean;
}

export interface INftMintStateProvider {
    status: Status;
    nextTime: number;
    mintedCount: number;
    maxSupply: number;
    nftPrice: number;
    mintableCount: number;
}