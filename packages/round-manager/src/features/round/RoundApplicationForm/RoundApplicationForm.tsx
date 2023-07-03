import { datadogLogs } from "@datadog/browser-logs";
import { useContext, useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { errorModalDelayMs } from "../../../constants";
import { useCreateRound } from "../../../context/round/CreateRoundContext";
import {
  ApplicationMetadata,
  Program,
  ProgressStatus,
  ProjectRequirements,
  Round,
} from "../../api/types";
import { generateApplicationSchema } from "../../api/utils";
import ErrorModal from "../../common/ErrorModal";
import { FormStepper as FS } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";
import InfoModal from "../../common/InfoModal";
import ProgressModal from "../../common/ProgressModal";
import _ from "lodash";
import { ApplicationQuestions, initialQuestions } from "./ApplicationQuestions";
import { Box } from "./Box";
import { InfoModalBody } from "./InfoModalBody";
import { ProjectSocials } from "./ProjectSocials";
import { ProjectInformation, ReviewInformation } from "./ProjectInformation";

export const initialRequirements: ProjectRequirements = {
  twitter: {
    required: false,
    verification: false,
  },
  github: {
    required: false,
    verification: false,
  },
};

/**
 * -------------------------------------------------------------------------------------------
 * Please remember to update the version number in the schema when making changes to the form.
 * -------------------------------------------------------------------------------------------
 */
const VERSION = "2.0.0";

export function RoundApplicationForm(props: {
  initialData: {
    program: Program;
  };
  stepper: typeof FS;
}) {
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openHeadsUpModal, setOpenHeadsUpModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const { currentStep, setCurrentStep, stepsCount, formData } =
    useContext(FormContext);
  const prev = () => setCurrentStep(currentStep - 1);
  const Steps = props.stepper;

  /* Reasonable to assume programId is non-null since we would redirect to 404 otherwise */
  const search = useLocation().search;
  const programId = new URLSearchParams(search).get("programId") as string;

  const navigate = useNavigate();

  const defaultQuestions: ApplicationMetadata["questions"] =
    // @ts-expect-error TODO: either fix this or refactor the whole formstepper
    formData?.applicationMetadata?.questions ?? initialQuestions;

  const { control, handleSubmit } = useForm<Round>({
    defaultValues: {
      ...formData,
      applicationMetadata: {
        questions: defaultQuestions,
      },
    },
  });

  const { fields, remove, append, update } = useFieldArray({
    name: "applicationMetadata.questions",
    control,
  });

  const [projectRequirements, setProjectRequirements] =
    useState<ProjectRequirements>({ ...initialRequirements });

  const {
    createRound,
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
  } = useCreateRound();

  useEffect(() => {
    const isSuccess =
      IPFSCurrentStatus === ProgressStatus.IS_SUCCESS &&
      votingContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      payoutContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      roundContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      indexingStatus === ProgressStatus.IS_SUCCESS;

    if (isSuccess) {
      redirectToProgramDetails(navigate, 2000, programId);
    }
  }, [
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
    programId,
    navigate,
  ]);

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_ERROR ||
      votingContractDeploymentStatus === ProgressStatus.IS_ERROR ||
      payoutContractDeploymentStatus === ProgressStatus.IS_ERROR ||
      roundContractDeploymentStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      redirectToProgramDetails(navigate, 5000, programId);
    }
  }, [
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
    navigate,
    programId,
  ]);

  const next: SubmitHandler<Round> = async (values) => {
    if (!openHeadsUpModal) {
      setOpenHeadsUpModal(true);
      return;
    }
    try {
      setOpenProgressModal(true);
      const data: Partial<Round> = _.merge(formData, values);

      const roundMetadataWithProgramContractAddress: Round["roundMetadata"] = {
        ...(data.roundMetadata as Round["roundMetadata"]),
        programContractAddress: programId,
      };

      const applicationQuestions = {
        lastUpdatedOn: Date.now(),
        applicationSchema: generateApplicationSchema(
          fields,
          projectRequirements
        ),
        version: VERSION,
      };

      const round = {
        ...data,
        ownedBy: programId,
        operatorWallets: props.initialData.program.operatorWallets,
      } as Round;

      await createRound({
        roundMetadataWithProgramContractAddress,
        applicationQuestions,
        round,
      });
    } catch (error) {
      datadogLogs.logger.error(
        `error: RoundApplcationForm next - ${error}, programId - ${programId}`
      );
      console.error("RoundApplcationForm", error);
    }
  };

  const progressSteps = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Deploying",
      description: "The quadratic funding contract is being deployed.",
      status: votingContractDeploymentStatus,
    },
    {
      name: "Deploying",
      description: "The payout contract is being deployed.",
      status: payoutContractDeploymentStatus,
    },
    {
      name: "Deploying",
      description: "The round contract is being deployed.",
      status: roundContractDeploymentStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  const disableNext: boolean =
    IPFSCurrentStatus === ProgressStatus.IN_PROGRESS ||
    votingContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    payoutContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    roundContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IS_SUCCESS ||
    !props.initialData.program;

  const projectRequirementsHandler = (
    data: [
      keyof ProjectRequirements,
      keyof ProjectRequirements[keyof ProjectRequirements],
      boolean
    ][]
  ) => {
    let tmpRequirements = { ...projectRequirements };

    data.forEach(([mainKey, subKey, value]) => {
      tmpRequirements = {
        ...tmpRequirements,
        [mainKey]: {
          ...tmpRequirements[mainKey],
          [subKey]: value,
        },
      };
    });

    setProjectRequirements(tmpRequirements);
  };

  const formSubmitModals = () => (
    <InfoModal
      title={"Heads up!"}
      body={<InfoModalBody />}
      isOpen={openHeadsUpModal}
      setIsOpen={setOpenHeadsUpModal}
      continueButtonAction={() => {
        handleSubmit(next)();
      }}
    >
      <ProgressModal
        isOpen={openProgressModal}
        subheading={"Please hold while we create your Grant Round."}
        steps={progressSteps}
      >
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          tryAgainFn={handleSubmit(next)}
          doneFn={() => {
            setOpenErrorModal(false);
            setOpenProgressModal(false);
            setOpenHeadsUpModal(false);
          }}
        />
      </ProgressModal>
    </InfoModal>
  );

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <ReviewInformation />
        <Box
          title="Project Information"
          description="These details will be collected from project owners by default during the project creation process."
        >
          <ProjectInformation />
        </Box>
      </div>
      <div className="md:grid md:grid-cols-3 md:gap-6 mt-7">
        <div className="md:col-span-1"></div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <Box
            title="Project Socials"
            description="These details will be collected from project owners by default during the creation process."
          >
            <ProjectSocials
              handler={projectRequirementsHandler}
              requirements={projectRequirements}
            />
          </Box>
        </div>
        <div className="md:col-span-1"></div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <Box
            title="Application Questions"
            description="Add round application questions for project owners to fulfill the application process."
            onlyTopRounded={true}
          >
            <ApplicationQuestions
              remove={remove}
              append={append}
              update={update}
              fields={fields}
            />
          </Box>
          <form onSubmit={handleSubmit(next)} className="text-grey-500">
            <div className="px-6 align-middle py-3.5 shadow-md">
              <Steps
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
                disableNext={disableNext}
              />
            </div>
          </form>
          {formSubmitModals()}
        </div>
      </div>
    </div>
  );
}

function redirectToProgramDetails(
  navigate: NavigateFunction,
  waitSeconds: number,
  programId: string
) {
  setTimeout(() => {
    navigate(`/program/${programId}`);
  }, waitSeconds);
}
