import CreateRoundPage from "../CreateRoundPage";
import { makeProgramData, renderWithProgramContext } from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { RoundDetailForm } from "../RoundDetailForm";
import ApplicationEligibilityForm from "../ApplicationEligibilityForm";
import { RoundApplicationForm } from "../RoundApplicationForm";
import { useWallet } from "../../common/Auth";
import * as FormWizardImport from "../../common/FormWizard";
import { fireEvent, screen } from "@testing-library/react";
import QuadraticFundingForm from "../QuadraticFundingForm";
import { Mock } from "vitest";
import { useSearchParams } from "react-router-dom";

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
const formWizardSpy = vi.spyOn(FormWizardImport, "FormWizard");

const programId = faker.finance.ethereumAddress();
const useParamsFn = () => [
  {
    get: () => programId,
  },
];

vi.mock("react-router-dom", async () => {
  const mod = await vi.importActual("react-router-dom");
  return {
    // @ts-expect-error mod
    ...mod,
    useSearchParams: vi.fn(),
  };
});

(useSearchParams as Mock).mockImplementation(useParamsFn);

describe("<CreateRoundPage />", () => {
  beforeEach(() => {
    (useWallet as Mock).mockReturnValue({
      chain: {},
      address: "0x0",
      provider: { getNetwork: () => ({ chainId: "0x0" }) },
    });
  });

  it("sends program to form wizard", () => {
    const programs = [makeProgramData({ id: programId })];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [
        RoundDetailForm,
        QuadraticFundingForm,
        ApplicationEligibilityForm,
        RoundApplicationForm,
      ],
      initialData: { program: programs[0] },
    });
  });

  it("exit button redirects to home", async () => {
    const programs = [makeProgramData({ id: programId })];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const exitButton = await screen.findByText("Exit");
    expect(exitButton).toBeTruthy();
    fireEvent.click(exitButton);
    expect(window.location.pathname).toBe("/");
  });

  it("sends program matching search query to form wizard", () => {
    const programToChoose = makeProgramData({ id: programId });
    const programs = [makeProgramData(), programToChoose, makeProgramData()];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [
        RoundDetailForm,
        QuadraticFundingForm,
        ApplicationEligibilityForm,
        RoundApplicationForm,
      ],
      initialData: { program: programToChoose },
    });
  });
});
