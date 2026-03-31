export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
}

export interface Scene {
  id: string;
  title: string;
  narrative: string;
  choices: Choice[];
  isEnding?: boolean;
}

export interface StoryMeta {
  title: string;
  subtitle: string;
  chapterLabel: string;
  currentSceneLabel: string;
  choicesPrompt: string;
  endingLabel: string;
  restartLabel: string;
  historyHeading: string;
  historyEmptyText: string;
  footerText: string;
  loadingText: string;
  startSceneId: string;
}

export interface StoryData {
  meta: StoryMeta;
  scenes: Scene[];
}

export interface HistoryEntry {
  sceneTitle: string;
  sceneNarrative: string;
  choiceMade: string;
}
