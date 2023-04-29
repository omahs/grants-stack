import { fetchProjectPaidInARound } from "common";
import { makeQFDistribution, makeRoundData } from "../../../../test-utils";
import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";
import { ChainId } from "../../utils";
import { fetchMatchingDistribution } from "../../round";
import React, { useState as useStateMock } from "react";

// Mocks
vi.mock("../../round");

vi.mock("common");

vi.mock("../../utils", async () => {
  const mod = await vi.importActual<typeof React>("../../utils");

  return {
    ...mod,
    graphql_fetch: vi.fn(),
    fetchFromIPFS: vi.fn(),
  };
});

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useOutletContext: () => ({
    data: {},
  }),
}));

vi.mock("react", async () => {
  const mod = await vi.importActual<typeof React>("react");

  return {
    ...mod,
    useState: vi.fn(),
    useEffect: vi.fn(),
  };
});

const paidProjects = [makeQFDistribution(), makeQFDistribution()];

const unProjects = [
  makeQFDistribution(),
  makeQFDistribution(),
  makeQFDistribution(),
];

describe("merklePayoutStrategy", () => {
  const setState = vi.fn();

  // clean up function
  beforeEach(() => {
    (useStateMock as any).mockImplementation((init: any) => [init, setState]);
  });

  describe.only("useGroupProjectsByPaymentStatus", () => {
    it("SHOULD group projects into paid and unpaid arrays", () => {
      const returnValue = { paid: [], unpaid: [] };
      const useStateSpy = vi.spyOn(React, "useState");
      useStateSpy.mockImplementationOnce(() => [returnValue, setState]);
      useStateSpy.mockImplementationOnce(() => [paidProjects, setState]);

      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      const projects = [...paidProjects, ...unProjects];
      // TODO: Fix this test
      (fetchProjectPaidInARound as any).mockImplementation(() => ({
        paidProjects,
      }));
      (fetchMatchingDistribution as any).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: projects,
      }));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = useGroupProjectsByPaymentStatus(chainId, round.id!);

      // expect(result.paid).toEqual(paidProjects);
      // expect(result.paid).toEqual(unProjects);
    });
  });
});
