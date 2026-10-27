export function validatePolicyInputs(
  maxTx: string,
  monthlyCap: string,
  requireAdminAbove: string
): string[] {
  const errors: string[] = [];
  const maxTxNum = parseFloat(maxTx);
  const monthlyCapNum = parseFloat(monthlyCap);

  if (isNaN(maxTxNum) || maxTxNum <= 0) {
    errors.push('Per-transaction cap must be a positive number');
  }
  if (isNaN(monthlyCapNum) || monthlyCapNum <= 0) {
    errors.push('Monthly budget cap must be a positive number');
  }
  if (!isNaN(maxTxNum) && !isNaN(monthlyCapNum) && maxTxNum > monthlyCapNum) {
    errors.push('Per-transaction cap cannot exceed monthly budget cap');
  }
  if (requireAdminAbove) {
    const adminThresh = parseFloat(requireAdminAbove);
    if (isNaN(adminThresh) || adminThresh <= 0) {
      errors.push('Admin approval threshold must be a positive number');
    }
  }
  return errors;
}
