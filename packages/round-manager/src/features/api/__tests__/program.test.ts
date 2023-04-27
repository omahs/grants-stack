import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";
import { makeProgramData } from "../../../test-utils";
import { fetchFromIPFS, ChainId, CHAINS } from "../utils";
import { graphql_fetch } from "common";

import { vi, Mock } from "vitest";

vi.mock("../utils", () => ({
  ...vi.importActual("../utils"),
  fetchFromIPFS: vi.fn(),
}));

vi.mock("common", () => ({
  ...vi.importActual("common"),
  graphql_fetch: vi.fn(),
}));

describe("listPrograms", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    // const address = "0x0"
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.GOERLI_CHAIN_ID],
    });
    const expectedPrograms: Program[] = [expectedProgram];
    (graphql_fetch as Mock).mockResolvedValue({
      data: {
        programs: [
          {
            id: expectedProgram.id,
            roles: [
              {
                accounts: [
                  {
                    address: expectedProgram.operatorWallets[0],
                  },
                ],
              },
            ],
            metaPtr: {
              protocol: 1,
              pointer:
                "uwijkhxkpkdgkszraqzqvhssqulctxzvntxwconznfkelzbtgtqysrzkehl",
            },
          },
        ],
      },
    });

    (fetchFromIPFS as Mock).mockResolvedValue({
      name: expectedProgram.metadata?.name,
    });

    const actualPrograms = await listPrograms("0x0", {
      getNetwork: async () =>
        // @ts-expect-error Test file
        Promise.resolve({ chainId: ChainId.GOERLI_CHAIN_ID }),
    });

    expect(actualPrograms).toEqual(expectedPrograms);
  });
});

describe("getProgramById", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.GOERLI_CHAIN_ID],
    });
    const programId = expectedProgram.id;
    (graphql_fetch as Mock).mockResolvedValue({
      data: {
        programs: [
          {
            id: expectedProgram.id,
            roles: [
              {
                accounts: [
                  {
                    address: expectedProgram.operatorWallets[0],
                  },
                ],
              },
            ],
            metaPtr: {
              protocol: 1,
              pointer:
                "uwijkhxkpkdgkszraqzqvhssqulctxzvntxwconznfkelzbtgtqysrzkehl",
            },
          },
        ],
      },
    });
    (fetchFromIPFS as Mock).mockResolvedValue({
      name: expectedProgram.metadata?.name,
    });

    const actualProgram = await getProgramById(programId as string, {
      getNetwork: async () =>
        // @ts-expect-error Test file
        Promise.resolve({ chainId: ChainId.GOERLI_CHAIN_ID }),
    });

    expect(actualProgram).toEqual(expectedProgram);
    const graphqlFetchCall = (graphql_fetch as Mock).mock.calls[0];
    const actualQuery = graphqlFetchCall[0];
    expect(actualQuery).toContain("id: $programId");
  });
});
