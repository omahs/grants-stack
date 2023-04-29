/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeApprovedProjectData,
  makeMatchingStatsData,
  makeQFDistribution,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithFinalizeRoundContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { useFetchMatchingDistributionFromContract } from "../../api/payoutStrategy/merklePayoutStrategy";
import { ProgressStatus, Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";
import { useRoundMatchingFunds } from "../../../hooks";
import { Mock, vi } from "vitest";

vi.mock("../../api/round");
vi.mock("wagmi");

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

let mockRoundData: Round = makeRoundData();

vi.mock("react-router-dom", async () => {
  const mod = await vi.importActual("react-router-dom");
  return {
    // @ts-expect-error mod
    ...mod,
    useParams: vi.fn(),
  };
});

vi.mock("../../../hooks", async () => {
  const mod = await vi.importActual("../../../hooks");
  return {
    // @ts-expect-error mod
    ...mod,
    useRoundMatchingFunds: vi.fn(),
  };
});

vi.mock("react-router-dom", async () => {
  const mod = await vi.importActual("react-router-dom");
  return {
    // @ts-expect-error mod
    ...mod,
    useParams: vi.fn(),
  };
});

vi.mock("../../api/payoutStrategy/merklePayoutStrategy", () => ({
  ...vi.importActual("../../api/payoutStrategy/merklePayoutStrategy"),
  useFetchMatchingDistributionFromContract: vi.fn(),
}));

vi.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {
      name: "Ethereum",
    },
    address: mockRoundData.operatorWallets![0],
    signer: {
      getChainId: () => {
        /* do nothing */
      },
    },
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

vi.mock("../../../constants", () => ({
  ...vi.importActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("View Round Results before distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as Mock).mockReturnValue({ chains: [] });
    (useDisconnect as Mock).mockReturnValue({});
  });

  describe("display round results tab", () => {
    it("displays matching stats table from api after round end date", async () => {
      (useRoundMatchingFunds as Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
      }));

      (useFetchMatchingDistributionFromContract as Mock).mockImplementation(
        () => ({
          distributionMetaPtr: "",
          matchingDistribution: [],
          isLoading: false,
          isError: null,
        })
      );

      const roundEndTime = faker.date.recent();
      const roundStartTime = faker.date.past(1, roundEndTime);
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);

      const approvedProjects = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      mockRoundData = makeRoundData({
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        approvedProjects,
      });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithFinalizeRoundContext(
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                })
              )
            )
          )
        )
      );
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
      expect(screen.getByTestId("match-stats-table")).toBeInTheDocument();
    });
  });

  describe("finalize state to contract", () => {
    beforeEach(() => {
      (useRoundMatchingFunds as Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
      }));

      (useFetchMatchingDistributionFromContract as Mock).mockImplementation(
        () => ({
          distributionMetaPtr: "",
          matchingDistribution: [],
          isLoading: false,
          isError: null,
        })
      );

      const roundEndTime = faker.date.past();
      mockRoundData = makeRoundData({ roundEndTime });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }),
                { programs: [] }
              ),
              {
                applications: [],
                isLoading: false,
              }
            )
          )
        )
      );
    });
    it("displays the finalize button", async () => {
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(
        screen.getByRole("button", {
          name: /Finalize Results/i,
        })
      ).toBeInTheDocument();
    });
  });
});

describe("View Round Results after distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as Mock).mockReturnValue({ chains: [] });
    (useDisconnect as Mock).mockReturnValue({});
  });

  it("displays finalized matching data from contract", async () => {
    (useRoundMatchingFunds as Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as Mock).mockImplementation(
      () => ({
        distributionMetaPtr: "abcd",
        matchingDistribution: [
          makeMatchingStatsData(),
          makeMatchingStatsData(),
        ],
        isLoading: false,
        isError: null,
      })
    );

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithFinalizeRoundContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("match-stats-table")).toBeInTheDocument();
  });
});
