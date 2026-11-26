const status = (item) => String(item?.assignmentStatus || item?.status || '').toUpperCase();
const list = (value) => Array.isArray(value) ? value : value?.content || value?.items || [];

// Journey decisions must include older live stays and contracts, not just page zero.
export async function loadJourneyPages(loadPage) {
  const items = [];
  for (let page = 0; ; page += 1) {
    const data = await loadPage(page, 100);
    if (Array.isArray(data)) return data;
    if (!Array.isArray(data?.content)) throw new Error('Không thể tải thông tin đăng ký phòng.');
    items.push(...data.content);
    if (data.last === true || data.content.length === 0
        || (data.totalPages != null && page + 1 >= data.totalPages)) return items;
  }
}

export function currentApplication(applications, contracts) {
  const items = list(applications);
  const contractList = list(contracts);
  return items.find((item) => status(item) === 'PENDING') || items.find((item) => {
    if (status(item) !== 'APPROVED') return false;
    const related = contractList.filter((c) => String(c.contractId) === String(item.contractId));
    return related.length === 0 || related.some((c) => ['PENDING', 'ACTIVE'].includes(status(c)));
  });
}

// Navigation reflects server state only; no progress is persisted in the browser.
export function studentJourney(assignments, contracts, applications) {
  const assignmentList = list(assignments);
  const hasResidenceHistory = assignmentList.some((item) => item.checkInAt || ['CHECKED_IN', 'CHECKED_OUT'].includes(status(item)));
  const checkedIn = assignmentList.find((item) => status(item) === 'CHECKED_IN');
  const assignment = checkedIn || assignmentList.find((item) => status(item) === 'ASSIGNED');
  const contractList = list(contracts);
  if (assignment) {
    const contract = contractList.find((item) => String(item.contractId) === String(assignment.contractId));
    return {
      hasRoom: Boolean(checkedIn), hasAssignment: true, hasResidenceHistory,
      registrationStage: checkedIn ? 'resident' : status(contract) === 'ACTIVE' ? 'waiting'
        : status(contract) === 'PENDING' && contract.depositStatus === 'HELD' ? 'schedule' : 'assigned',
      stagePath: '/student/residence',
    };
  }
  const application = currentApplication(applications, contractList);
  const holdingContract = contractList.find((c) => ['PENDING', 'ACTIVE'].includes(status(c)));
  if (!application && holdingContract) {
    return {
      hasRoom: false, hasAssignment: false, hasResidenceHistory,
      registrationStage: status(holdingContract) === 'ACTIVE' ? 'waiting'
        : holdingContract.depositStatus === 'HELD' ? 'schedule' : 'deposit',
      stagePath: '/student/residence',
    };
  }
  const approved = status(application) === 'APPROVED';
  return {
    hasRoom: false, hasAssignment: false, hasResidenceHistory,
    registrationStage: approved ? 'deposit' : application ? 'pending' : 'search',
    stagePath: approved && application.depositInvoiceId
      ? `/student/invoices/${application.depositInvoiceId}`
      : application ? '/student/applications' : '/student/rooms',
  };
}
