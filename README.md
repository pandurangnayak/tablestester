# Multiplication Tables Tester - Design Document

## Overview
A static web application to help primary school children practice multiplication tables with a playful, cloud-themed interface.

Live Demo: [https://tablestester.surge.sh](https://tablestester.surge.sh)


Vibe-coded using [Amazon Q Developer CLI](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html)


## Requirements

### Functional Requirements
- **Table Selection**: Checkboxes for numbers 2-15 to select multiplication tables
- **Test Control**: Start Test button to begin the quiz
- **Timer**: Visual countdown/timer display
- **Flash Cards**: Large display showing multiplication problems (e.g., "6 x 8")
- **Answer Input**: Text box and submit button for answers
- **Feedback**: Display "CORRECT" or "WRONG" with sound effects and animations
- **Problem Generation**: 
  - Left number: Random from selected checkboxes
  - Right number: Random between 2-10

### Technical Requirements
- Static HTML/CSS/JavaScript application
- No external dependencies
- Responsive design for tablets/computers
- Audio feedback for correct/incorrect answers
- Smooth animations for feedback

## User Interface Design

### Layout
- **Header**: Title and checkbox selection area (2-15)
- **Main Area**: 
  - Timer display
  - Large flash card for multiplication problem
  - Answer input field and submit button
- **Footer**: Score/progress indicator

### Visual Theme
- **Background**: Dreamy cloud theme with soft gradients
- **Colors**: Soft blues, whites, and pastels
- **Typography**: Child-friendly, rounded fonts
- **Animations**: Bouncing effects for correct answers, shake for incorrect

### Sound Effects
- Cheerful chime for correct answers
- Gentle buzz for incorrect answers
- Optional background ambient sounds

## User Flow
1. Parent selects desired multiplication tables (checkboxes)
2. Click "Start Test" button
3. Timer begins countdown
4. Flash card displays random multiplication problem
5. Child enters answer and clicks submit
6. Feedback shown with animation and sound
7. Next problem automatically appears
8. Test continues until timer expires or manual stop

## File Structure
```
/
├── index.html          # Main application file
├── style.css          # Styling and animations
├── script.js          # Application logic
└── DESIGN.md          # This design document
```

## Future Enhancements
- Score tracking and statistics
- Difficulty levels
- Progress saving
- Multiple choice options
- Achievement badges
