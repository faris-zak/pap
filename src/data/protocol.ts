export type StageId = 'activation' | 'investigation'

export type ProtocolBlock = {
  id: string
  title: string
  minutes: number
  important?: boolean
  instructions: string[]
}

export type ProtocolStage = {
  id: StageId
  title: string
  minutes: number
  blocks: ProtocolBlock[]
}

export const protocol: ProtocolStage[] = [
  {
    id: 'activation',
    title: 'Mental activation',
    minutes: 90,
    blocks: [
      { id: 'cognitive-re-entry', title: 'Cognitive re-entry', minutes: 15, instructions: ['Name the topic and set aside distractions.', 'Write three things you remember without looking.', 'Identify the first question you want to answer.'] },
      { id: 'mathematical-activation', title: 'Mathematical activation', minutes: 20, instructions: ['Work through key algebra or calculus tools.', 'Derive one familiar result from memory.', 'Note any symbols or operations that feel rusty.'] },
      { id: 'math-to-physics-bridge', title: 'Math-to-physics bridge', minutes: 25, important: true, instructions: ['Connect each equation to a physical claim.', 'Check dimensions before moving on.', 'Describe what changes when a variable increases.'] },
      { id: 'physical-visualization', title: 'Physical visualization', minutes: 20, instructions: ['Draw the system, axes, and constraints.', 'Imagine limiting cases and boundary conditions.', 'State what a measurement would look like.'] },
      { id: 'investigation-briefing', title: 'Investigation briefing', minutes: 10, instructions: ['Write a precise investigation question.', 'List the evidence or derivation you need.', 'Choose a first small, testable step.'] }
    ]
  },
  {
    id: 'investigation',
    title: 'Deep physics investigation',
    minutes: 120,
    blocks: [
      { id: 'conceptual-investigation', title: 'Conceptual investigation', minutes: 25, instructions: ['Read with a question in mind.', 'Separate assumptions from conclusions.', 'Write the core principle in your own words.'] },
      { id: 'mathematical-derivation', title: 'Mathematical derivation', minutes: 30, instructions: ['Derive step by step without skipping units.', 'Mark the first uncertain transition.', 'Check the result against a known limit.'] },
      { id: 'physical-interpretation', title: 'Physical interpretation', minutes: 15, instructions: ['Translate the result into a prediction.', 'Identify what the signs and scales mean.', 'Sketch the behaviour of the system.'] },
      { id: 'independent-problem-solving', title: 'Independent problem-solving', minutes: 40, instructions: ['Solve before checking a reference.', 'State your strategy before calculating.', 'Review errors as evidence, not verdicts.'] },
      { id: 'researchers-log', title: "Researcher's log", minutes: 10, instructions: ['Record the result and open questions.', 'Capture one useful equation or diagram.', 'Choose the next investigation starting point.'] }
    ]
  }
]

export const allBlocks = protocol.flatMap((stage) => stage.blocks.map((block) => ({ ...block, stageId: stage.id })))

export const getBlock = (id: string) => allBlocks.find((block) => block.id === id)
