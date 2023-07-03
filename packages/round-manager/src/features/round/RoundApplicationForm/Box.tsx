export const Box = ({
  title,
  description,
  onlyTopRounded = false,
  children,
}: {
  title: string;
  description: string;
  onlyTopRounded?: boolean;
  children: React.ReactNode;
}) => (
  <div className="mt-5 md:mt-0 md:col-span-2">
    <div
      className={`${
        onlyTopRounded ? "rounded-t" : "rounded"
      } shadow-sm bg-white pt-7 pb-6 sm:px-6`}
    >
      <p className="mb-2 font-bold">{title}</p>
      <p className="text-sm text-grey-400 mb-6">{description}</p>
      <hr />
      <div>{children}</div>
    </div>
  </div>
);
