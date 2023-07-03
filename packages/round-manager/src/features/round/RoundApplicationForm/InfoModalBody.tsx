export function InfoModalBody() {
  return (
    <div className="text-sm text-grey-400 gap-16">
      <p className="text-sm">
        Each grant round on the protocol requires three smart contracts.
      </p>
      <p className="text-sm my-2">
        You'll have to sign a transaction to deploy each of the following:
      </p>
      <ul className="list-disc list-inside pl-3">
        <li>Quadratic Funding contract</li>
        <li>Payout contract</li>
        <li>Round core contract</li>
      </ul>
    </div>
  );
}
