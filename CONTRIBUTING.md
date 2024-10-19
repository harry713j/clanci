## Prerequisites

- Docker Basics
- pnpm (optional, if not running Docker)

## Setup Instructions

1. **Fork the Repository**

   - Go to the top right corner of this repository, and click the "Fork" button.

2. **Clone the Forked Repository**

   - Clone the forked repository locally:
     ```bash
     git clone https://github.com/harry713j/clanci
     cd blog-app
     ```

3. **Set Up Environment Variables**

   - Create a `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Replace the variables as needed.

4. **Run with Docker**
   - Build and start the containers:
     ```bash
     docker-compose up --build
     ```
   - Access the app at `http://localhost:3000`.

## How to Contribute

1. **Create a New Branch**:

   - Make sure you are on the `main` branch:
     ```bash
     git checkout main
     ```
   - Create a new branch for your feature or bugfix:
     ```bash
     git checkout -b <branch-name>
     ```

2. **Make Your Changes**:

   - Implement your feature or fix the bug.
   - Run tests or make sure everything works before committing.

3. **Commit and Push**:

   - Commit your changes with a clear commit message:
     ```bash
     git add .
     git commit -m "Add feature or fix"
     git push origin <branch-name>
     ```

4. **Create a Pull Request (PR)**:

   - Go to your forked repository on GitHub and create a Pull Request to the original repo’s `main` branch.
   - Provide a detailed description of your changes.

5. **Coding Guidelines**:

   - Use meaningful commit messages.
   - Follow coding standards, e.g., ESLint rules and Prettier

6. **Set Up Issue Templates (Optional):**

   GitHub allows you to set up issue templates that contributors can use when they report bugs or request features. To set up an issue template:

   - Go to your GitHub repository's settings.
   - Under the "Issues" section, choose to set up issue templates.
   - Add templates for "Bug Reports" and "Feature Requests."
