export function complexityTier(score: number): "MVP" | "Startup" | "Scale" | "Enterprise" | "Distributed Enterprise" {
  if (score < 25) return "MVP";
  if (score < 45) return "Startup";
  if (score < 65) return "Scale";
  if (score < 85) return "Enterprise";
  return "Distributed Enterprise";
}

export function normalizeLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 45) return "Low";
  if (score < 75) return "Medium";
  return "High";
}
