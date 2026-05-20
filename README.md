<h1 align="center">Interactive Kanban Board</h1>

An interactive board based on the *Kanban* agile methodology, fully developed with **HTML, CSS, and Vanilla JavaScript**.
It allows users to manage tasks visually and dynamically while demonstrating DOM manipulation, event handling, business logic, and data persistence using **LocalStorage**.

This project was designed to showcase frontend development skills without relying on frameworks or external libraries.

---

## General Description

The Interactive Kanban Board allows task management through three workflow states:

- **To Do** – pending tasks.
- **In Progress** – tasks currently being worked on.
- **Done** – completed tasks.

Each ticket includes:
- Title
- Priority (High, Medium, Low)
- Unique identifier

The board also includes validations and restrictions to simulate a real-world workflow environment.

---

## Main Features

### Ticket Creation
- Users can create tickets from the top form.
- A title is required before creating a ticket.
- New tickets are always added to the **To Do** column.

### Priorities
Each ticket has a visual priority indicator:
- 🔴 High
- 🟡 Medium
- 🟢 Low

### Drag & Drop
- Tickets can be dragged between columns.
- Implemented restrictions:
  - Tickets cannot move directly from **To Do → Done**.
  - Tickets cannot move back from **Done → To Do**.
  - The **In Progress** column has a maximum limit of **5 tickets** to avoid task overload and encourage task completion.

### Priority Filter
- Allows users to display tickets based on their priority.
- It only changes visibility and does not remove data.

### Automatic Counters
Each column dynamically displays the number of tickets it contains.

### LocalStorage Persistence
- Uses **LocalStorage** to:
  - Save all tickets.
  - Preserve their current state and column.
  - Keep the ticket counter persistent.
  - Automatically restore data after page reload.

### Board Reset
- Includes a **“Clear Board”** button with validations:
  - If the board is empty, a warning message is displayed.
  - If tickets exist, a custom confirmation dialog appears.
- Safely clears both the board and LocalStorage data.

### Dark Mode
- Toggleable through a custom switch button.
- User preference is saved in **LocalStorage**.
- The selected mode remains active after reloading the page.
- Implemented without duplicating styles or breaking the original layout.  

### Custom Messages
- Visual warning messages with *fade in / fade out* animations.
- Custom confirmation dialogs instead of the browser’s default `confirm()`.
- Improved user experience (UX).

---

## Kanban Workflow
1. The user creates a ticket in **To Do**.
2. The ticket moves to **In Progress** once work begins.
3. Only then can it move to **Done**.
4. The system prevents invalid workflow transitions.

This workflow simulates real agile methodology practices.

---

## Technologies Used
- **HTML5**
   -Semantic structure of the board.
- **CSS3**
  - Visual design, states, animations, messages, and Dark Mode.
- **JavaScript (Vanilla)**
  - DOM manipulation.
  - Drag & Drop functionality.
  - Business logic validations.
- **LocalStorage**
  - Data persistence.

---

## Project Structure

```
/interactive-kanban-board
│
├── assets/        # Icons and resources
├── index.html     # Main structure
├── styles.css     # Board styling
├── main.js        # Kanban logic
├── README.md      # Project documentation
└── LICENSE        # Legal usage rules
```
---

## Example Tickets
- "Implement JWT login"
- "Fix registration form bug"
- "Design user profile view"
- "Optimize database queries"
- "Add form validations"

---

## Project Purpose
This project was created for:
- Practicing Vanilla JavaScript
- Demonstrating business logic implementation
- Building a professional portfolio
- Simulating a real-world workflow environment
---

## Preview
<div align="center">
  <img src="assets/board-kanban.png" width="600" alt="Tablero Kanban Intercativo"/>
</div>

---

## Author
*Developed by Byron Jorge Ortega Cuenca*