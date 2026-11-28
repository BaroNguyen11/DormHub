const status = (item) => String(item?.status || '').toUpperCase();
const assignmentStatus = (item) => String(item?.assignmentStatus || item?.status || '').toUpperCase();
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

const sameId = (a, b) => a != null && b != null && String(a) === String(b);
const holdsContract = (contract) => ['PENDING', 'ACTIVE'].includes(status(contract));

export function currentApplication(applications, contracts, assignments = []) {
  return studentJourney(assignments, contracts, applications).application || undefined;
}

// Navigation reflects server state only; no progress is persisted in the browser.
export function studentJourney(assignments, contracts, applications, openRequest = null) {
  const assignmentList = list(assignments);
  const hasResidenceHistory = assignmentList.some((item) => item.checkInAt || ['CHECKED_IN', 'CHECKED_OUT'].includes(assignmentStatus(item)));
  const checkedIn = assignmentList.find((item) => assignmentStatus(item) === 'CHECKED_IN');
  const assignment = checkedIn || assignmentList.find((item) => assignmentStatus(item) === 'ASSIGNED');
  const contractList = list(contracts);
  const applicationList = list(applications);
  // A live stay wins over a pending registration. Never pair unrelated records.
  const contract = assignment
    ? contractList.find((c) => sameId(c.contractId, assignment.contractId))
    : contractList.find(holdsContract);
  const approved = contract && (holdsContract(contract) || (checkedIn && status(contract) === 'EXPIRED'))
    ? applicationList.find((a) => status(a) === 'APPROVED' && sameId(a.contractId, contract.contractId))
    : null;
  const pending = applicationList.find((a) => status(a) === 'PENDING');
  const orphanApproved = applicationList.some((a) => status(a) === 'APPROVED'
    && !contractList.some((c) => sameId(c.contractId, a.contractId)));
  const application = approved || (!assignment && !contract ? pending : null);
  const checkoutOpen = openRequest?.kind === 'checkout' || openRequest?.blocksRegistration === true;
  let registrationStage = 'search';
  if (assignment || contract) {
    registrationStage = 'unresolved';
    if (checkedIn && contract && ['ACTIVE', 'EXPIRED'].includes(status(contract))) {
      registrationStage = 'resident';
    } else if (status(contract) === 'PENDING' && contract.depositStatus === 'UNPAID' && !assignment) {
      registrationStage = 'deposit';
    } else if (assignmentStatus(assignment) === 'ASSIGNED' && contract?.depositStatus === 'HELD') {
      registrationStage = status(contract) === 'ACTIVE' ? 'waiting'
        : status(contract) === 'PENDING' ? 'schedule' : 'unresolved';
    }
  } else if (checkoutOpen) registrationStage = 'unresolved';
  else if (pending) registrationStage = 'pending';
  else if (orphanApproved) registrationStage = 'unresolved';
  const depositInvoiceId = approved?.depositInvoiceId ?? null;
  const progressStep = { search: 0, pending: 1, deposit: 2, schedule: 3, waiting: 4 }[registrationStage] ?? null;
  return {
    assignment: assignment || null, contract: contract || null, application: application || null,
    depositInvoiceId, depositPaid: contract?.depositStatus === 'HELD',
    hasRoom: registrationStage === 'resident', hasAssignment: Boolean(assignment), hasResidenceHistory,
    hasActiveProcess: registrationStage !== 'search', registrationStage, progressStep,
    stagePath: registrationStage === 'search' ? '/student/rooms'
      : registrationStage === 'pending' ? '/student/applications'
      : registrationStage === 'deposit' && depositInvoiceId ? `/student/invoices/${depositInvoiceId}`
      : registrationStage === 'unresolved' && checkoutOpen ? openRequest.path
      : !assignment && !contract ? '/student/applications' : '/student/residence',
  };
}
