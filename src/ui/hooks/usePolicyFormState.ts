'use client';

import { useState } from 'react';
import { CurrencyCode } from '@/domain/money/currency';
import { FormattedPolicyDTO } from '@/ui/components/policies/types';

export function usePolicyFormState() {
  const [formName, setFormName] = useState('Default Spending Policy');
  const [formCurrency, setFormCurrency] = useState<CurrencyCode>('USD');
  const [formMaxTx, setFormMaxTx] = useState('250.00');
  const [formMonthlyCap, setFormMonthlyCap] = useState('1000.00');
  const [formRequireAdminAbove, setFormRequireAdminAbove] = useState('');
  const [formAllowedCategories, setFormAllowedCategories] = useState('');
  const [formBlockedMerchants, setFormBlockedMerchants] = useState('');

  const populateFromPolicy = (pol: FormattedPolicyDTO) => {
    setFormName(pol.name);
    setFormCurrency(pol.currency);
    setFormMaxTx(pol.maxTransactionAmount);
    setFormMonthlyCap(pol.monthlyBudgetCap);
    setFormRequireAdminAbove(pol.requireAdminAbove || '');
    setFormAllowedCategories(pol.allowedCategories ? pol.allowedCategories.join(', ') : '');
    setFormBlockedMerchants(pol.blockedMerchants ? pol.blockedMerchants.join(', ') : '');
  };

  return {
    formName, setFormName,
    formCurrency, setFormCurrency,
    formMaxTx, setFormMaxTx,
    formMonthlyCap, setFormMonthlyCap,
    formRequireAdminAbove, setFormRequireAdminAbove,
    formAllowedCategories, setFormAllowedCategories,
    formBlockedMerchants, setFormBlockedMerchants,
    populateFromPolicy,
  };
}
