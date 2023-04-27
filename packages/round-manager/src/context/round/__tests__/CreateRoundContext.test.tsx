import { saveToIPFS } from "../../../features/api/ipfs";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import {
  CreateRoundData,
  CreateRoundProvider,
  useCreateRound,
} from "../CreateRoundContext";
import { deployRoundContract } from "../../../features/api/round";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";
import { deployMerklePayoutStrategyContract } from "../../../features/api/payoutStrategy/merklePayoutStrategy";
import { deployQFVotingContract } from "../../../features/api/votingStrategy/qfVotingStrategy";
import { vi, Mock, SpyInstance } from "vitest";
const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

vi.mock("../../../features/api/votingStrategy/qfVotingStrategy");
vi.mock("../../../features/api/payoutStrategy/merklePayoutStrategy");
vi.mock("../../../features/api/round");
vi.mock("../../../features/api/ipfs");
vi.mock("../../../features/api/subgraph");
vi.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
vi.mock("wagmi");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

describe("<CreateRoundProvider />", () => {
  function invokeCreateRound() {
    const createRound = screen.getByTestId("create-round");
    fireEvent.click(createRound);
  }

  describe("Set IPFS Status", () => {
    beforeEach(() => {
      (deployQFVotingContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
      (deployMerklePayoutStrategyContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
    });

    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (saveToIPFS as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets ipfs status to complete when saving to ipfs succeeds", async () => {
      (saveToIPFS as Mock).mockResolvedValue("my ipfs doc :)))");

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Voting Contract Deployment Status", () => {
    beforeEach(() => {
      const ipfsHash = "bafabcdef";
      (saveToIPFS as Mock).mockResolvedValue(ipfsHash);
      (deployRoundContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
    });

    it("sets voting contract deployment status to in progress when voting contract is being deployed", async () => {
      (deployQFVotingContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `voting-deploying-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets voting contract deployment status to success when voting contract has been deployed", async () => {
      (deployQFVotingContract as Mock).mockResolvedValue({
        votingContractAddress: "0xVotingContract",
      });
      (deployMerklePayoutStrategyContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `voting-deploying-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Payout Contract Deployment Status", () => {
    beforeEach(() => {
      const ipfsHash = "bafabcdef";
      (saveToIPFS as Mock).mockResolvedValue(ipfsHash);
      (deployQFVotingContract as Mock).mockResolvedValue({
        votingContractAddress: "0xVotingContract",
      });
      (deployRoundContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
    });

    it("sets payout contract deployment status to in progress when payout contract is being deployed", async () => {
      (deployMerklePayoutStrategyContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `payout-deploying-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets payout contract deployment status to success when payout contract has been deployed", async () => {
      (deployMerklePayoutStrategyContract as Mock).mockResolvedValue({
        payoutContractAddress: "0xPayoutContract",
      });

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `payout-deploying-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Round Contract Deployment Status", () => {
    const ipfsHash = "bafabcdef";
    beforeEach(() => {
      (saveToIPFS as Mock).mockResolvedValue(ipfsHash);
      (deployQFVotingContract as Mock).mockResolvedValue({
        votingContractAddress: "0xVotingContract",
      });
      (deployMerklePayoutStrategyContract as Mock).mockResolvedValue({
        payoutContractAddress: "0xPayoutContract",
      });
    });

    it("sets round contract deployment status to in progress when round contract is being deployed", async () => {
      (deployRoundContract as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `round-deploying-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
      const firstCall = (deployRoundContract as Mock).mock.calls[0];
      const roundParameter = firstCall[0];
      const actualRoundMetadataPointer = roundParameter.store;
      expect(actualRoundMetadataPointer).toEqual({
        protocol: 1,
        pointer: ipfsHash,
      });
      const actualApplicationSchemaPointer = roundParameter.applicationStore;
      expect(actualApplicationSchemaPointer).toEqual({
        protocol: 1,
        pointer: ipfsHash,
      });
    });

    it("sets round contract deployment status to success when round contract has been deployed", async () => {
      (deployRoundContract as Mock).mockResolvedValue({});

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `round-deploying-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Indexing Status", () => {
    const transactionBlockNumber = 10;
    beforeEach(() => {
      (saveToIPFS as Mock).mockResolvedValue("bafabcdef");
      (deployQFVotingContract as Mock).mockResolvedValue({
        votingContractAddress: "0xVotingContract",
      });
      (deployMerklePayoutStrategyContract as Mock).mockResolvedValue({
        payoutContractAddress: "0xPayoutContract",
      });
      (deployRoundContract as Mock).mockResolvedValue({
        transactionBlockNumber,
      });
    });

    it("sets indexing status to in progress when waiting for subgraph to index", async () => {
      (waitForSubgraphSyncTo as Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets indexing status to completed when subgraph is finished indexing", async () => {
      (waitForSubgraphSyncTo as Mock).mockResolvedValue(transactionBlockNumber);

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("useCreateRound() Errors", () => {
    let consoleErrorSpy: SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        /* do nothing.*/
      });

      // set up initial mocks for each internal function call
      (saveToIPFS as Mock).mockResolvedValue("asdf");
      (deployQFVotingContract as Mock).mockResolvedValue({
        votingContractAddress: "0xVotingContract",
      });
      (deployMerklePayoutStrategyContract as Mock).mockResolvedValue({
        payoutContractAddress: "0xPayoutContract",
      });
      (deployRoundContract as Mock).mockResolvedValue({
        transactionBlockNumber: 100,
      });
      (waitForSubgraphSyncTo as Mock).mockResolvedValue(100);
    });

    afterEach(() => {
      consoleErrorSpy.mockClear();
    });

    it("sets ipfs status to error when ipfs save fails", async () => {
      (saveToIPFS as Mock).mockRejectedValue(new Error(":("));

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets voting contract deployment status to error when voting deployment fails", async () => {
      (deployQFVotingContract as Mock).mockRejectedValue(
        new Error("Failed to deploy :(")
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `voting-deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets round contract deployment status to error when round deployment fails", async () => {
      (deployRoundContract as Mock).mockRejectedValue(
        new Error("Failed to deploy :(")
      );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `round-deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets indexing status to error when waiting for subgraph to sync fails", async () => {
      (waitForSubgraphSyncTo as Mock).mockRejectedValue(new Error(":("));

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("if ipfs save fails, resets ipfs status when create round is retried", async () => {
      (saveToIPFS as Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      await screen.findByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`);

      // retry create-round operation
      invokeCreateRound();

      expect(
        screen.queryByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });

    it("if voting contract deployment fails, resets voting contract deployment status when create round is retried", async () => {
      (deployQFVotingContract as Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      await screen.findByTestId(
        `voting-deploying-status-is-${ProgressStatus.IS_ERROR}`
      );

      invokeCreateRound();

      expect(
        screen.queryByTestId(
          `voting-deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).not.toBeInTheDocument();
    });

    it("if round contract deployment fails, resets round contract deployment status when create round is retried", async () => {
      (deployRoundContract as Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      await screen.findByTestId(
        `round-deploying-status-is-${ProgressStatus.IS_ERROR}`
      );

      invokeCreateRound();

      expect(
        screen.queryByTestId(
          `round-deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).not.toBeInTheDocument();
    });

    it("if indexing fails, resets indexing status when create round is retried", async () => {
      (waitForSubgraphSyncTo as Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateRoundComponent />);
      invokeCreateRound();

      await screen.findByTestId(
        `indexing-status-is-${ProgressStatus.IS_ERROR}`
      );

      invokeCreateRound();

      expect(
        screen.queryByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });
  });
});

const TestUseCreateRoundComponent = () => {
  const {
    createRound,
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
  } = useCreateRound();

  return (
    <div>
      <button
        onClick={() => createRound({} as unknown as CreateRoundData)}
        data-testid="create-round"
      >
        Create My Program
      </button>

      <div data-testid={`storing-status-is-${IPFSCurrentStatus}`} />

      <div
        data-testid={`voting-deploying-status-is-${votingContractDeploymentStatus}`}
      />

      <div
        data-testid={`payout-deploying-status-is-${payoutContractDeploymentStatus}`}
      />

      <div
        data-testid={`round-deploying-status-is-${roundContractDeploymentStatus}`}
      />

      <div data-testid={`indexing-status-is-${indexingStatus}`} />
    </div>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<CreateRoundProvider>{ui}</CreateRoundProvider>);
}
