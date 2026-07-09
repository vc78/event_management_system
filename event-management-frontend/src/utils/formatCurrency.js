export const formatCurrency=(v,c='INR')=>new Intl.NumberFormat('en-IN',{style:'currency',currency:c,maximumFractionDigits:0}).format(v??0);
