/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent, render, screen } from "@testing-library/react";
import ViewRoundPage from "../ViewRoundPage";
import { ProgressStatus, Round } from "../../api/types";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSwitchNetwork,
  useSigner,
} from "wagmi";
import { useParams } from "react-router-dom";
import { useTokenPrice } from "../../api/utils";
import { faker } from "@faker-js/faker";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder } = require("util");
global.TextDecoder = TextDecoder;

import { vi, Mock } from "vitest";

vi.mock("../../common/Auth");
vi.mock("wagmi");

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

let mockRoundData: Round = makeRoundData();

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useParams: vi.fn(),
}));

vi.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

vi.mock("../../api/utils", () => ({
  ...vi.importActual("../../api/utils"),
  useTokenPrice: vi.fn(),
}));

describe("fund contract tab", () => {
  beforeEach(() => {
    (useParams as Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as Mock).mockReturnValue({ chains: [] });
    (useDisconnect as Mock).mockReturnValue({});
  });

  it("displays fund contract tab", async () => {
    mockRoundData = makeRoundData();

    (useTokenPrice as Mock).mockImplementation(() => ({
      data: "100",
      error: null,
      loading: false,
    }));

    (useBalance as Mock).mockImplementation(() => ({
      data: { formatted: "0", value: "0" },
      error: null,
      loading: false,
    }));

    (useAccount as Mock).mockImplementation(() => ({
      address: faker.finance.ethereumAddress(),
    }));

    (useSigner as Mock).mockImplementation(() => ({
      signer: {
        getBalance: () => Promise.resolve("0"),
      },
    }));

    render(
      wrapWithBulkUpdateGrantApplicationContext(
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
    );
    const fundContractTab = screen.getByTestId("fund-contract");
    fireEvent.click(fundContractTab);
    expect(screen.getByText("Contract Details")).toBeInTheDocument();
    expect(screen.getByText("Contract Address:")).toBeInTheDocument();
    expect(screen.getByText("Payout token:")).toBeInTheDocument();
    expect(screen.getByText("Matching pool size:")).toBeInTheDocument();
    expect(screen.getByText("Protocol fee:")).toBeInTheDocument();
    expect(screen.getByText("Round fee:")).toBeInTheDocument();
    expect(screen.getByText("Amount in contract:")).toBeInTheDocument();
    expect(screen.getByTestId("fund-contract-btn")).toBeInTheDocument();
    expect(screen.getByTestId("view-contract-btn")).toBeInTheDocument();
  });
});
