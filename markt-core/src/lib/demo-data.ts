export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface SampleRow {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface DashboardTableRow {
  customer: string;
  agent: string;
  value: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRevenueData(): ChartDataPoint[] {
  let base = rand(8000, 12000);
  return months.map((name) => {
    base += rand(-1500, 2500);
    base = Math.max(5000, base);
    return { name, value: base };
  });
}

export function generateOrderData(days: number = 14): ChartDataPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: rand(20, 180),
  }));
}

export function generateCategoryData(): ChartDataPoint[] {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
  return categories.map((name) => ({
    name,
    value: rand(100, 900),
  }));
}

export function generateAgentData(): ChartDataPoint[] {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  let score = rand(60, 75);
  return weeks.map((name) => {
    score += rand(-5, 10);
    score = Math.min(100, Math.max(40, score));
    return { name, value: score };
  });
}

const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];
const statuses: SampleRow['status'][] = ['completed', 'pending', 'failed'];

export function generateSparklineData(points: number = 12): ChartDataPoint[] {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let v = rand(40, 80);
  return Array.from({ length: points }, (_, i) => {
    v += rand(-15, 20);
    v = Math.max(10, Math.min(100, v));
    return { name: labels[i % labels.length]!, value: v };
  });
}

export function generateTableData(rows: number = 10): SampleRow[] {
  return Array.from({ length: rows }, (_, i) => {
    const first = firstNames[rand(0, firstNames.length - 1)]!;
    const last = lastNames[rand(0, lastNames.length - 1)]!;
    return {
      id: `TXN-${String(1000 + i).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      amount: rand(50, 5000),
      status: statuses[rand(0, 2)]!,
      date: `2026-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
    };
  });
}

const agentNames = [
  'Sarah Chen',
  'Alex Reed',
  'Priya Shah',
  'Marcus Hill',
  'Nina Park',
  'Owen Gray',
];

function randomPersonName() {
  const first = firstNames[rand(0, firstNames.length - 1)]!;
  const last = lastNames[rand(0, lastNames.length - 1)]!;
  return `${first} ${last}`;
}

export function generateLatestOrdersData(rows: number = 8): DashboardTableRow[] {
  return Array.from({ length: rows }, () => ({
    customer: randomPersonName(),
    agent: agentNames[rand(0, agentNames.length - 1)]!,
    value: `£${rand(120, 5200).toLocaleString()}`,
  }));
}

export function generateNewEnquiriesData(rows: number = 8): DashboardTableRow[] {
  return Array.from({ length: rows }, () => ({
    customer: randomPersonName(),
    agent: agentNames[rand(0, agentNames.length - 1)]!,
    value: `£${rand(300, 12000).toLocaleString()}`,
  }));
}
