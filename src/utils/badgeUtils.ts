export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'bg-green-900/30 text-green-400 border border-green-600';
    case 'intermediate': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-600';
    case 'advanced': return 'bg-red-900/30 text-red-400 border border-red-600';
    default: return 'bg-gray-800 text-gray-300 border border-gray-600';
  }
}

export function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Intermediate';
    case 'advanced': return 'Advanced';
    default: return difficulty;
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'offense': return 'bg-blue-900/30 text-blue-400 border border-blue-600';
    case 'defense': return 'bg-red-900/30 text-red-400 border border-red-600';
    default: return 'bg-gray-800 text-gray-300 border border-gray-600';
  }
}

export function getCategoryText(category: string): string {
  switch (category) {
    case 'offense': return 'Offense';
    case 'defense': return 'Defense';
    default: return category;
  }
}
