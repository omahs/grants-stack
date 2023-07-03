// is this always going to be static?
export function ProjectInformation() {
  const fields = [
    { name: "Project Name", required: true },
    { name: "Project Website", required: true },
    { name: "Project Logo", required: false },
    { name: "Project Banner", required: false },
    { name: "Project Description", required: true },
  ];

  return (
    <>
      {fields.map((field, i) => (
        <div key={i}>
          <div className="flex my-4">
            <span className="flex-1 text-sm">{field.name}</span>
            <FieldRequiredOptionalMarker required={field.required} />
          </div>
          {i !== fields.length - 1 && <hr />}
        </div>
      ))}
    </>
  );
}

export const FieldRequiredOptionalMarker = (props: { required: boolean }) => (
  <span
    className={`text-xs ${
      props.required ? "text-violet-400" : "text-grey-400"
    }`}
  >
    {props.required ? "*Required" : "Optional"}
  </span>
);

export function ReviewInformation() {
  return (
    <div className="md:col-span-1">
      <p className="text-base leading-6">Review Information</p>
      <p className="mt-1 text-sm text-grey-400">
        Carefully review the information details Project Owners will need to
        fulfill the application process.
      </p>
      <p className="italic mt-4 text-sm text-grey-400">
        Note: that some personal identifiable information will be stored
        publicly.
      </p>
    </div>
  );
}
