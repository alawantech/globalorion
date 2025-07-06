// Matrix calculation utilities for MLM system

export interface MatrixLevel {
  level: number
  requiredMembers: number
  commissionPerMember: number
  totalCommission: number
}

export interface UserMatrixData {
  userId: number
  currentLevel: number
  totalDownlines: number
  levelProgress: MatrixLevel[]
  totalEarnings: number
  pendingEarnings: number
}

export const MATRIX_CONFIG = {
  maxLevels: 6,
  membersPerLevel: 5,
  commissionRates: [4000, 2000, 2000, 1500, 1500, 1500], // Per member commission for each level
}

export function calculateMatrixRequirements(): MatrixLevel[] {
  const levels: MatrixLevel[] = []

  for (let i = 1; i <= MATRIX_CONFIG.maxLevels; i++) {
    const requiredMembers = Math.pow(MATRIX_CONFIG.membersPerLevel, i)
    const commissionPerMember = MATRIX_CONFIG.commissionRates[i - 1]
    const totalCommission = requiredMembers * commissionPerMember

    levels.push({
      level: i,
      requiredMembers,
      commissionPerMember,
      totalCommission,
    })
  }

  return levels
}

export function calculateUserProgress(userDownlines: number[]): UserMatrixData {
  const levels = calculateMatrixRequirements()
  const levelProgress: MatrixLevel[] = []
  let totalEarnings = 0
  let pendingEarnings = 0
  let currentLevel = 0

  levels.forEach((level, index) => {
    const currentDownlines = userDownlines[index] || 0
    const isComplete = currentDownlines >= level.requiredMembers
    const earnedAmount = isComplete ? level.totalCommission : 0
    const pendingAmount = isComplete ? 0 : currentDownlines * level.commissionPerMember

    if (isComplete && currentLevel === index) {
      currentLevel = index + 1
    }

    totalEarnings += earnedAmount
    pendingEarnings += pendingAmount

    levelProgress.push({
      ...level,
      totalCommission: earnedAmount,
    })
  })

  return {
    userId: 0, // Will be set by caller
    currentLevel,
    totalDownlines: userDownlines.reduce((sum, count) => sum + count, 0),
    levelProgress,
    totalEarnings,
    pendingEarnings,
  }
}

export function getMatrixPosition(userId: number, sponsorId: number, level: number): number {
  // Calculate matrix position based on sponsor and level
  // This is a simplified version - real implementation would be more complex
  const basePosition = Math.floor(Math.random() * MATRIX_CONFIG.membersPerLevel) + 1
  return basePosition
}

export function canUserEarnCommission(userLevel: number, commissionLevel: number): boolean {
  // User can only earn commission from levels they have completed
  return userLevel >= commissionLevel
}

export function calculateCommissionAmount(level: number, memberCount: number): number {
  if (level < 1 || level > MATRIX_CONFIG.maxLevels) {
    return 0
  }

  const commissionRate = MATRIX_CONFIG.commissionRates[level - 1]
  return commissionRate * memberCount
}
