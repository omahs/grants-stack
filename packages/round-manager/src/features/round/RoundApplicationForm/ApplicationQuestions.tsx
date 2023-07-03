import { EditQuestion, InputType, Round } from "../../api/types";
import { PencilIcon, PlusSmIcon, XIcon } from "@heroicons/react/solid";
import AddQuestionModal from "../../common/AddQuestionModal";
import PreviewQuestionModal from "../../common/PreviewQuestionModal";
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
} from "react-hook-form";
import { InputIcon } from "../../common/InputIcon";
import { typeToText } from "../../api/utils";
import { FieldRequiredOptionalMarker } from "./ProjectInformation";
import {
  EyeIcon,
  EyeOffIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/outline";
import { Button } from "common/src/styles";
import { useState } from "react";

export interface SchemaQuestion {
  id: number;
  title: string;
  type: InputType;
  required: boolean;
  hidden: boolean;
  choices?: string[];
  encrypted: boolean;
}

export const payoutQuestion: SchemaQuestion = {
  id: 0,
  title: "Payout Wallet Address",
  required: true,
  encrypted: false,
  hidden: true,
  type: "address",
};
export const initialQuestions: SchemaQuestion[] = [
  {
    id: 1,
    title: "Email Address",
    required: true,
    encrypted: true,
    hidden: true,
    type: "email",
  },
  {
    id: 2,
    title: "Funding Sources",
    required: true,
    encrypted: false,
    hidden: false,
    type: "short-answer",
  },
  {
    id: 3,
    title: "Team Size",
    required: true,
    encrypted: false,
    hidden: false,
    type: "number",
  },
];

const fieldEncrypted = (encrypted: boolean) => (
  <div className={`text-xs text-grey-400 flex flex-row`}>
    <div className="w-4 mr-1">
      {encrypted ? <LockClosedIcon /> : <LockOpenIcon />}
    </div>
    <div>{encrypted ? "Encrypted" : "Not Encrypted"}</div>
  </div>
);

const fieldHidden = (hidden: boolean) => (
  <div className={`text-xs text-grey-400 flex flex-row`}>
    <div className="w-4 mr-1">{hidden ? <EyeOffIcon /> : <EyeIcon />}</div>
    <div>{hidden ? "Hidden from Explorer" : "Shown in Explorer"}</div>
  </div>
);

const singleQuestion = (
  field: SchemaQuestion,
  key: number,
  removeQuestion: UseFieldArrayRemove,
  setToEdit: (editQuestion: EditQuestion) => void,
  setOpenAddQuestionModal: (open: boolean) => void
) => (
  <div key={key} data-testid="application-question">
    <div className="flex flex-row my-4 items-center">
      <div className="text-sm basis-2/3">
        <div className="flex flex-row text-xs text-grey-400 items-center">
          <span>
            <InputIcon className="mr-1 mb-0.5" type={field.type} size={14} />
          </span>
          <span className="first-letter:capitalize">
            {typeToText(field.type)}
          </span>
        </div>
        {field.title}
        {field.choices &&
          field.choices?.length > 0 &&
          field.choices.map((choice, index) => (
            <div key={index} className="ml-1 border-l border-gray-200">
              <span className="ml-2">&bull;</span>
              <span className="ml-2 text-xs">{choice}</span>
            </div>
          ))}
      </div>
      <div className="basis-1/3 flex justify-end items-center">
        <div className="text-sm justify-end p-2 leading-tight">
          <div className="flex justify-end">
            <FieldRequiredOptionalMarker required={field.required} />
          </div>
          <div className="flex justify-end">
            {fieldEncrypted(field.encrypted)}
          </div>
          <div className="flex justify-end">{fieldHidden(field.hidden)}</div>
        </div>
        <div className="text-sm justify-center flex p-2">
          <div className="w-5">
            {key >= 0 && (
              <PencilIcon
                data-testid="edit-question"
                className="cursor-pointer"
                onClick={() => {
                  setToEdit({
                    index: key,
                    field: field,
                  });
                  setOpenAddQuestionModal(true);
                }}
              />
            )}
          </div>
        </div>
        <div className="w-5 text-red-600">
          {key >= 0 && (
            <div
              data-testid="remove-question"
              onClick={() => removeQuestion(key)}
            >
              <XIcon className="cursor-pointer" />
            </div>
          )}
        </div>
      </div>
    </div>
    <hr />
  </div>
);

type ApplicationQuestionsProps = {
  fields: FieldArrayWithId<Round, "applicationMetadata.questions", "id">[];
  append: UseFieldArrayAppend<Round, "applicationMetadata.questions">;
  update: UseFieldArrayUpdate<Round, "applicationMetadata.questions">;
  remove: UseFieldArrayRemove;
};

export const ApplicationQuestions = ({
  fields,
  append,
  update,
  remove,
}: ApplicationQuestionsProps) => {
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);

  const [toEdit, setToEdit] = useState<EditQuestion | undefined>();

  const lockedQuestion = singleQuestion(
    payoutQuestion,
    -1,
    remove,
    setToEdit,
    setOpenAddQuestionModal
  );
  const f = fields.map((field, i) =>
    singleQuestion(field, i, remove, setToEdit, setOpenAddQuestionModal)
  );

  const addOrEditQuestion = (question: EditQuestion) => {
    setOpenAddQuestionModal(false);
    if (question.field) {
      if (!question.index && question.index !== 0) {
        append({ ...question.field, id: fields.length });
      } else {
        update(question.index, question.field);
      }
    }
  };

  return (
    <div>
      {[lockedQuestion, ...f]}
      <Button
        type="button"
        $variant="outline"
        className="inline-flex items-center px-3.5 py-2 mt-5 border-none shadow-sm text-sm rounded text-violet-500 bg-violet-100"
        onClick={() => {
          setToEdit(undefined);
          setOpenAddQuestionModal(true);
        }}
      >
        <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
        Add question
      </Button>
      <AddQuestionModal
        show={openAddQuestionModal}
        onSave={addOrEditQuestion}
        onClose={() => {
          setToEdit(undefined);
          setOpenAddQuestionModal(false);
        }}
        question={toEdit}
      />
      <PreviewQuestionModal
        show={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
      />
    </div>
  );
};
