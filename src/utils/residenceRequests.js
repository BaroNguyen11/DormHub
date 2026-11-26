import { resources } from '../services/resource.service';

export async function getOpenResidenceRequest() {
  const types = [
    ['renewal', '/student/renewal-requests', 'renewalRequestId', ['PENDING']],
    ['transfer', '/student/room-transfer-requests', 'transferId', ['PENDING', 'APPROVED']],
    ['checkout', '/student/checkout-requests', 'checkoutRequestId', ['PENDING', 'APPROVED']],
  ];
  const results = await Promise.all(types.flatMap(([kind, path, idField, statuses]) => statuses.map(async (status) => {
    let page = 0;
    while (true) {
      const data = await resources.list(path, { page, size: 100, status });
      const items = Array.isArray(data) ? data : data?.content || [];
      const item = items.find((row) => statuses.includes(row.status)
        && !(kind === 'transfer' && row.status === 'APPROVED' && row.handoverPending !== true));
      if (item) return { kind, path: `${path}/${item[idField]}`, id: item[idField] };
      if (Array.isArray(data) || data?.last === true || items.length < 100
          || (data?.totalPages != null && page + 1 >= data.totalPages)) return null;
      page += 1;
    }
  })));
  return results.find(Boolean) || null;
}

export function renewalEndDate(value, months) {
  const text = String(value || '').slice(0, 10);
  const count = Number(months);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isInteger(count) || count < 1 || count > 12) return null;
  const [year, month] = text.split('-').map(Number);
  return new Date(Date.UTC(year, month + count, 0));
}

export async function getTransferRoomChoices(request) {
  const choices = [];
  let page = 0;
  while (true) {
    const data = await resources.list('/manager/rooms', { page, size: 100, status: 'AVAILABLE' });
    const items = Array.isArray(data) ? data : data?.content || [];
    choices.push(...items.filter((room) => room.isAvailable === true
      && Number(room.availableSlots) > 0
      && String(room.id) !== String(request.currentRoomId)
      && room.genderRestriction === request.studentGender
      && Number(room.pricePerMonth) === Number(request.monthlyRent)));
    if (Array.isArray(data) || data?.last === true || items.length < 100
        || (data?.totalPages != null && page + 1 >= data.totalPages)) break;
    page += 1;
  }
  return choices;
}
