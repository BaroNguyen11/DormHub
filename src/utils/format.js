export const money = value => value == null ? '—' : `${new Intl.NumberFormat('vi-VN').format(Number(value))} ₫`
export const date = value => { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat('vi-VN').format(d) }
