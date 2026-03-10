# Choose Your Own Adventure Story App

An interactive web application that allows users to explore branching stories where their choices determine the outcome. Users can follow multiple paths through a story and see a record of the decisions they have made along the way.

This project was developed as an Agile team project focusing on user stories, sprint goals, and incremental delivery of features.

---

## Project Overview

The application allows users to:

- Select from multiple base stories
- Progress through a branching narrative
- Make choices that influence the story outcome
- Reach multiple possible endings
- View a history of the decisions they made during the story
- See both the current story scene and their journey history on a single interactive page

The system is designed around a **choose-your-own-adventure** storytelling model.

---

## Core Features

### Story Selection
Users begin on a landing page where they can choose from several base stories.

### Interactive Story Engine
Each story consists of scenes with 2–4 choices that lead to other scenes.

### Multiple Endings
Each story contains:
- Three narrative endings
- One death ending

### Story History Tracking
The system tracks the user's decisions and displays them in a history panel so users can review their journey.

### Interactive Story Page
The interface includes:
- A **main story panel** displaying the current scene
- A **history panel** showing previously visited scenes and choices

---

## Story Structure

Stories are composed of several components:

### Story
Represents the overall narrative.

Fields:
- `storyId`
- `title`
- `description`
- `startingSceneId`

---

### Scene
Represents a step in the story.

Fields:
- `sceneId`
- `storyId`
- `sceneText`

Each scene presents the player with **2–4 choices**.

---

### Choice
Represents a decision the user can make.

Fields:
- `choiceId`
- `sceneId`
- `choiceText`
- `nextSceneId`

---

## Story Session Tracking

Each playthrough creates a **Story Session**.

### StorySession
Tracks a user's active playthrough.

Fields:
- `sessionId`
- `storyId`
- `currentSceneId`
- `startTime`
- `status`

---

### HistoryEntry
Tracks the decisions a user makes during a story.

Fields:
- `historyEntryId`
- `sessionId`
- `sceneId`
- `choiceId`
- `choiceText`
- `nextSceneId`
- `stepOrder`
- `timestamp`

---

## Example Story Flow

```

Start
|
v
Scene 1
| 
|  
Choice A  Choice B
|        |
v        v
Scene 2   Scene 3
|        |
v        v
Ending A  Ending B

```

Each decision leads to a new scene until the user reaches one of the story endings.

---

## User Interface Layout

The interactive story page contains two main areas:

```

+---------------------------------------------+
|                 STORY AREA                  |
|                                             |
|   Current scene text and available choices |
|                                             |
+-----------------------+---------------------+
|      HISTORY PANEL    |                     |
|  Previous scenes and  |                     |
|  choices made by user |                     |
+-----------------------+---------------------+

```

---

## Agile Development

The project was developed using Agile practices including:

- User stories
- Acceptance criteria
- Sprint planning
- Incremental feature delivery

Example user stories implemented:

- Landing page with story selection
- Base story creation with branching scenes
- Interactive story page with history panel
- Story session tracking

---

## Possible Future Improvements

Potential enhancements include:

- User accounts and saved progress
- Analytics on most common story paths
- Visual story maps
- Animated transitions between scenes
- Additional stories and story packs
- Multiplayer collaborative stories
- AI-generated story branches

---

## Contributing

Contributions are welcome.

Typical contributions may include:

- Writing new story branches
- Improving UI/UX
- Refactoring story data structures
- Adding new features

Please create a pull request describing your changes.

---

## License

This project is intended for educational use.

---

## Authors

Developed as part of an Agile software development project.
