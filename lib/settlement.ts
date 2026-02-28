export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface NetEntry {
  id: string;
  name: string;
  net: number;
}

export function calculateSettlement(netPoints: Record<string, { name: string; net: number }>): Transfer[] {
  const entries: NetEntry[] = Object.entries(netPoints).map(([id, v]) => ({ id, name: v.name, net: v.net }));

  const creditors = entries.filter(p => p.net > 0).sort((a, b) => b.net - a.net);
  const debtors = entries.filter(p => p.net < 0).sort((a, b) => a.net - b.net);

  const transfers: Transfer[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].net, creditors[j].net);
    if (pay > 0) {
      transfers.push({
        fromId: debtors[i].id,
        fromName: debtors[i].name,
        toId: creditors[j].id,
        toName: creditors[j].name,
        amount: pay
      });
      debtors[i] = { ...debtors[i], net: debtors[i].net + pay };
      creditors[j] = { ...creditors[j], net: creditors[j].net - pay };
    }
    if (debtors[i].net === 0) i++;
    if (creditors[j].net === 0) j++;
  }

  return transfers;
}
