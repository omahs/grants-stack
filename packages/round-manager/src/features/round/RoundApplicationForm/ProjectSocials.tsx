import { ProjectRequirements } from "../../api/types";
import BaseSwitch from "../../common/BaseSwitch";

export const ProjectSocials = ({
  handler,
  requirements,
}: {
  handler: (
    data: [
      keyof ProjectRequirements,
      keyof ProjectRequirements[keyof ProjectRequirements],
      boolean
    ][]
  ) => void;
  requirements: ProjectRequirements;
}) => (
  <>
    <div
      className={`flex flex-row mt-4 ${
        requirements.twitter.required ? "mb-1" : "mb-4"
      }`}
    >
      <div className="text-sm basis-4/5">Project Twitter</div>
      <div className="basis-1/5 flex justify-end">
        <BaseSwitch
          testid="test-switch-id"
          activeLabel="*Required"
          inactiveLabel="*Optional"
          value={requirements.twitter.required}
          handler={async (a: boolean) => {
            // clear required twitterVerification, if twitter itself is not required
            handler([
              ["twitter", "required", a],
              ["twitter", "verification", false],
            ]);
          }}
        />
      </div>
    </div>
    {requirements.twitter.required && (
      <div className="flex flex-row items-center mb-4 border-gray-200 border border-l-1 border-r-0 border-t-0 border-b-0">
        <div className="text-xs basis-4/5 ml-2">
          Verification of account ownership
        </div>
        <div className="basis-1/5 flex justify-end">
          <BaseSwitch
            testid="test-switch-id"
            activeLabel="*Required"
            inactiveLabel="*Optional"
            value={requirements.twitter.verification}
            handler={async (a: boolean) => {
              handler([["twitter", "verification", a]]);
            }}
          />
        </div>
      </div>
    )}
    <hr />
    <div
      className={`flex flex-row mt-4 ${
        requirements.github.required ? "mb-1" : "mb-4"
      }`}
    >
      <div className="text-sm basis-4/5">Project Github</div>
      <div className="basis-1/5 flex justify-end">
        <BaseSwitch
          testid="test-switch-id"
          activeLabel="*Required"
          inactiveLabel="*Optional"
          value={requirements.github.required}
          handler={async (a: boolean) => {
            // clear required githubVerification, if GitHub itself is not required
            handler([
              ["github", "required", a],
              ["github", "verification", false],
            ]);
          }}
        />
      </div>
    </div>
    {requirements.github.required && (
      <div className="flex flex-row items-center mb-4 border-gray-200 border border-l-1 border-r-0 border-t-0 border-b-0">
        <div className="text-xs basis-4/5 ml-2">
          Verification of account ownership
        </div>
        <div className="basis-1/5 flex justify-end">
          <BaseSwitch
            testid="test-switch-id"
            activeLabel="*Required"
            inactiveLabel="*Optional"
            value={requirements.github.verification}
            handler={async (a: boolean) => {
              handler([["github", "verification", a]]);
            }}
          />
        </div>
      </div>
    )}
  </>
);
