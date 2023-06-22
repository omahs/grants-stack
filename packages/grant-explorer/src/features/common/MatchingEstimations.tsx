import { useMemo } from "react";
import { Client } from "allo-indexer-client";
import { useWallet } from "./Auth";
import { Contribution, linearQF } from "pluralistic";
import useSWR from "swr";
import { Round } from "allo-indexer-client";
import { useAccount, useNetwork } from "wagmi";
import { getAddress, Hex, zeroAddress } from "viem";

export function useAlloIndexerClient(): Client {
  const { chain } = useNetwork();

  return useMemo(() => {
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL ?? "",
      chain?.id ?? 1
    );
  }, [chain?.id]);
}

export function useProjectContributions(roundId: string, projectId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/applications"], ([roundId]) => {
    return client.getVotes(roundId);
  });
}

export function useRound(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", roundId);
  });
}

/**
 * Pseudocode
 * - get matching amount without user contribution
 * for each donation amount:
 * - get amount after user contribution by running linearQF with the added vote
 * - deduct match amount w/o user contribution to get new matching
 * - return new matching
 *  */
export function MatchingEstimations({
  roundId,
  projectId,
  recipient,
}: {
  projectId: string;
  roundId: string;
  recipient: string;
}) {
  const { address } = useAccount();
  const { data: round } = useRound(getAddress(roundId));
  const { data: votes } = useProjectContributions(
    getAddress(roundId),
    projectId
  );

  if (!round || !votes) {
    return null;
  }
  const rawContributions: Contribution[] = (votes ?? []).map((vote) => ({
    amount: BigInt(Math.round(vote.amountUSD)),
    recipient: vote.grantAddress,
    contributor: vote.voter,
  }));

  const amountMatchedBeforeUserContribution = linearQF(
    rawContributions,
    BigInt(Math.round(round?.matchAmountUSD) ?? 0),
    BigInt(18)
    // TODO: fetch additional options for round
  );

  const matchingBeforeUserContribution =
    amountMatchedBeforeUserContribution[recipient]?.matched;

  const matchingPredictions = [0, 1, 10, 100, 1000]
    .map((donationAmount) => {
      const contributions: Contribution[] = [
        ...rawContributions,
        {
          amount: BigInt(Math.round(donationAmount)),
          contributor: address ?? zeroAddress,
          recipient: recipient,
        },
      ];
      const amountMatchedAfterUserContribution = linearQF(
        contributions,
        BigInt(Math.round(round?.matchAmountUSD) ?? 0),
        BigInt(18)
        // TODO: fetch additional options for round
      )[recipient]?.matched;

      return (
        amountMatchedAfterUserContribution - matchingBeforeUserContribution
      );
    })
    .map((bigint) => Number(bigint));
  return <div>{JSON.stringify(matchingPredictions)}</div>;
}
